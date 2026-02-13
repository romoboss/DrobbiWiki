function parseFrontmatter(text) {

    if (!text.startsWith("---"))
        return { data:{}, content:text };

    const parts = text.split("---");

    const rawMeta = parts[1].trim();
    const content = parts.slice(2).join("---");

    const data = {};

    rawMeta.split("\n").forEach(line => {

        const [key,...rest] = line.split(":");
        if (!key) return;

        data[key.trim()] = rest.join(":").trim();
    });

    return { data, content };
}

function convertWikiLinks(text) {

    return text.replace(/\[\[(.*?)(\|(.*?))?\]\]/g,
        (_, page, __, label) => {

            const name = label || page;

            return `[${name}](?page=${encodeURIComponent(page)})`;
        });
}

function extractCategories(text) {

    const categories = [];

    text = text.replace(/\[\[Category:(.*?)\]\]/g,
        (_, cat) => {
            categories.push(cat.trim());
            return "";
        });

    return { text, categories };
}

function renderInfobox(meta) {

    if (!Object.keys(meta).length) return "";

    let html = "<table class='infobox'>";

    if (meta.image) {
        html += `
            <tr>
                <td colspan="2">
                    <img src="/images/${meta.image}">
                </td>
            </tr>`;
    }

    Object.entries(meta).forEach(([key,val]) => {

        if (key === "image" || key === "title") return;

        html += `
        <tr>
            <th>${key}</th>
            <td>${val}</td>
        </tr>`;
    });

    html += "</table>";

    return html;
}

function generateTOC(container) {

    const headings = container.querySelectorAll("h2, h3");

    if (!headings.length) return "";

    let toc = "<h3>Contents</h3><ul>";

    headings.forEach(h => {

        const id = h.textContent.replace(/\s+/g,"-").toLowerCase();
        h.id = id;

        toc += `<li><a href="#${id}">${h.textContent}</a></li>`;
    });

    toc += "</ul>";

    return toc;
}

function parseCustomGallery(mdContent) {

    const galleryRegex = /-gallery-\s*([\s\S]*?)\s*-\/gallery-/gi;

    return mdContent.replace(galleryRegex, (_, galleryContent) => {

        const lines = galleryContent
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const galleryHTML = lines.map(line => {

            const parts = line.split("|");
            if (parts.length < 2) return "";

            const name = parts[0].trim();
            const caption = parts.slice(1).join("|").trim();

            return `
                    <div class="gallery-item">
                        <img src="images/${name}.png" alt="${name}">
                        <div class="caption">${caption}</div>
                    </div>`;
        }).join("");

        return `<div class="gallery">${galleryHTML}</div>`;
    });
}


function parseWikiPage(markdown) {
    let { data, content } = parseFrontmatter(markdown);

    const catResult = extractCategories(content);
    content = catResult.text;
    const categories = catResult.categories;

    content = convertWikiLinks(content);
    content = parseCustomGallery(content);

    const html = marked.parse(content);

    return { data, html, categories };
}

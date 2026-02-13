async function loadPage() {

    const params = new URLSearchParams(location.search);
    const page = params.get("page") || "about";

    try {

        const res = await fetch(`pages/${page}.md`);
        const text = await res.text();

        const parsed = parseWikiPage(text);

        document.getElementById("pageTitle").textContent =
            parsed.data.title || page;

        document.getElementById("wikiContent").innerHTML =
            parsed.html;

        document.getElementById("infobox").innerHTML =
            renderInfobox(parsed.data);

        const tocHTML = generateTOC(
            document.getElementById("wikiContent")
        );

        document.getElementById("toc").innerHTML = tocHTML;

        document.getElementById("categories").innerHTML =
            parsed.categories.map(c =>
                `<span class="category">${c}</span>`
            ).join(" ");

    }
    catch {
        document.getElementById("wikiContent").innerHTML =
            "<h2>Page not found</h2>";
    }
}

loadPage();

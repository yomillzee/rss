function getSavedArticles(){

    try{

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "savedArticles"
                ) || "[]"
            );

        return saved.filter(
            article =>
                article &&
                typeof article === "object" &&
                article.link
        );

    }

    catch(error){

        console.error(
            "Saved articles parse error:",
            error
        );

        return [];

    }

}

function setSavedArticles(saved){

    localStorage.setItem(
        "savedArticles",
        JSON.stringify(saved)
    );

}

function getDismissedArticles(){

    try{

        const dismissed =
            JSON.parse(
                localStorage.getItem(
                    "dismissedArticles"
                ) || "[]"
            );

        return dismissed.filter(
            link =>
                typeof link === "string"
        );

    }

    catch(error){

        console.error(
            "Dismissed articles parse error:",
            error
        );

        return [];

    }

}

function setDismissedArticles(dismissed){

    localStorage.setItem(
        "dismissedArticles",
        JSON.stringify(dismissed)
    );

}

function decodeLink(link){

    try{
        return decodeURIComponent(link);
    }

    catch(error){
        return link;
    }

}

function escapeHtml(value){

    return String(value || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}

function escapeAttr(value){

    return escapeHtml(value);

}

function getDateValue(dateString){

    if(!dateString){
        return 0;
    }

    const normalized =
        String(dateString)
            .replace(" ","T");

    const date =
        new Date(normalized);

    if(isNaN(date)){
        return 0;
    }

    return date.getTime();

}

function isArticleSaved(link){

    return getSavedArticles().some(
        article =>
            article.link === link
    );

}

function showToast(message){

    const existingToast =
        document.querySelector(
            ".toast"
        );

    if(existingToast){
        existingToast.remove();
    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "toast";

    toast.textContent =
        message;

    document.body.appendChild(
        toast
    );

    requestAnimationFrame(() => {

        toast.classList.add(
            "toast-visible"
        );

    });

    setTimeout(() => {

        toast.classList.remove(
            "toast-visible"
        );

    }, 2200);

    setTimeout(() => {

        toast.remove();

    }, 2600);

}

function saveArticle(link){

    const decodedLink =
        decodeLink(link);

    const article =
        window.allStories.find(
            story =>
                story.link === decodedLink
        );

    if(!article){
        showToast("Article not found");
        return;
    }

    const saved =
        getSavedArticles();

    const exists =
        saved.some(
            item =>
                item.link === article.link
        );

    if(exists){
        showToast("Already saved");
        return;
    }

    saved.unshift(article);

    setSavedArticles(saved);

    renderSavedArticles();
    renderFeed();

    showToast("Saved");

}

function unsaveArticle(link){

    const decodedLink =
        decodeLink(link);

    const saved =
        getSavedArticles()
            .filter(
                article =>
                    article.link !== decodedLink
            );

    setSavedArticles(saved);

    renderSavedArticles();
    renderFeed();

    showToast("Removed");

}

function dismissArticle(link){

    const decodedLink =
        decodeLink(link);

    const dismissed =
        getDismissedArticles();

    if(
        dismissed.includes(
            decodedLink
        )
    ){
        return;
    }

    dismissed.unshift(
        decodedLink
    );

    setDismissedArticles(
        dismissed
    );

    renderFeed();

    showToast("Dismissed");

}

window.saveArticle =
    saveArticle;

window.unsaveArticle =
    unsaveArticle;

window.dismissArticle =
    dismissArticle;

window.allStories = [];
window.searchTerm = "";

async function getFeed(feed){

    try{

        const endpoint =
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=20`;

        const response =
            await fetch(endpoint);

        const data =
            await response.json();

        if(
            !data ||
            !Array.isArray(data.items)
        ){
            console.warn(
                "No items returned for",
                feed.name,
                data
            );

            return [];
        }

        return data.items.map(item => ({

            category:
                feed.category,

            source:
                feed.name,

            title:
                item.title || "Untitled",

            link:
                item.link || "#",

            thumbnail:
                item.thumbnail ||
                item.enclosure?.link ||
                null,

            published:
                item.pubDate ||
                item.date ||
                item.isoDate ||
                null,

            summary:
                stripHtml(
                    item.description || ""
                )

        }));

    }

    catch(error){

        console.error(
            "Feed error:",
            feed.name,
            error
        );

        return [];

    }

}

function renderSaveButton(story){

    const saved =
        isArticleSaved(
            story.link
        );

    if(saved){

        return `

        <button
            class="save-btn is-saved"
            onclick="unsaveArticle('${encodeURIComponent(story.link)}')"
        >
            ★ SAVED
        </button>

        `;

    }

    return `

    <button
        class="save-btn"
        onclick="saveArticle('${encodeURIComponent(story.link)}')"
    >
        Save
    </button>

    `;

}

function renderStory(story){

    const title =
        escapeHtml(story.title);

    const link =
        escapeAttr(story.link);

    const source =
        escapeHtml(story.source);

    const category =
        escapeHtml(story.category);

    const summary =
        escapeHtml(
            (story.summary || "")
                .substring(0,250)
        );

    const thumbnail =
        story.thumbnail
            ? escapeAttr(story.thumbnail)
            : "";

    return `

    <div class="story">

        ${
            thumbnail
            ?
            `
            <img
                class="story-thumb"
                src="${thumbnail}"
                alt=""
                loading="lazy"
            >
            `
            :
            ""
        }

        <div class="category">
            ${category}
        </div>

        <div class="title">
            <a href="${link}" target="_blank">
                ${title}
            </a>
        </div>

        <div class="meta">
            ${source}
        </div>

        ${
            story.published
            ?
            `
            <div class="published">
                ${formatDate(story.published)}
            </div>
            `
            :
            ""
        }

        ${
            summary
            ?
            `
            <div class="summary">
                ${summary}...
            </div>
            `
            :
            ""
        }

        <div class="story-actions">

            ${renderSaveButton(story)}

            <button
                class="dismiss-btn"
                onclick="dismissArticle('${encodeURIComponent(story.link)}')"
            >
                Dismiss
            </button>

        </div>

    </div>

    `;

}

function renderSavedArticles(){

    const container =
        document.getElementById(
            "saved-feed"
        );

    if(!container){
        return;
    }

    const saved =
        getSavedArticles();

    if(saved.length === 0){

        container.innerHTML =
            '<div class="empty">No saved articles yet.</div>';

        return;

    }

    container.innerHTML =
        saved.map(article => {

            const title =
                escapeHtml(article.title);

            const link =
                escapeAttr(article.link);

            const source =
                escapeHtml(article.source);

            const category =
                escapeHtml(article.category);

            return `

            <div class="story">

                <div class="category">
                    ${category}
                </div>

                <div class="title">
                    <a href="${link}" target="_blank">
                        ${title}
                    </a>
                </div>

                <div class="meta">
                    ${source}
                </div>

                ${
                    article.published
                    ?
                    `
                    <div class="published">
                        ${formatDate(article.published)}
                    </div>
                    `
                    :
                    ""
                }

                <button
                    class="unsave-btn"
                    onclick="unsaveArticle('${encodeURIComponent(article.link)}')"
                >
                    Unsave
                </button>

            </div>

            `;

        }).join("");

}

function getVisibleStories(){

    const dismissed =
        getDismissedArticles();

    return window.allStories
        .filter(
            story =>
                !dismissed.includes(
                    story.link
                )
        )
        .filter(story => {

            if(!window.searchTerm){
                return true;
            }

            const search =
                window.searchTerm
                    .toLowerCase();

            const searchableText =
                [
                    story.title,
                    story.source,
                    story.category,
                    story.summary
                ]
                .join(" ")
                .toLowerCase();

            return searchableText
                .includes(search);

        });

}

function renderFeed(){

    const topFeed =
        document.getElementById(
            "top-feed"
        );

    const sections = {

        AI:
            document.getElementById(
                "ai-feed"
            ),

        Tech:
            document.getElementById(
                "tech-feed"
            ),

        Search:
            document.getElementById(
                "search-feed"
            ),

        Business:
            document.getElementById(
                "business-feed"
            ),

        Marketing:
            document.getElementById(
                "marketing-feed"
            ),

        Politics:
            document.getElementById(
                "politics-feed"
            )

    };

    Object
        .values(sections)
        .forEach(el => {

            if(el){
                el.innerHTML = "";
            }

        });

    const visibleStories =
        getVisibleStories();

    if(topFeed){

        const newestStories =
            [...visibleStories]
                .sort(
                    (a,b) =>
                        getDateValue(b.published) -
                        getDateValue(a.published)
                )
                .slice(0,10);

        topFeed.innerHTML =
            newestStories.length
                ?
                newestStories
                    .map(renderStory)
                    .join("")
                :
                '<div class="empty">No top stories right now.</div>';

    }

    Object
        .keys(sections)
        .forEach(category => {

            const target =
                sections[category];

            if(!target){
                return;
            }

            const categoryStories =
                visibleStories
                    .filter(
                        story =>
                            story.category === category
                    )
                    .slice(0,10);

            target.innerHTML =
                categoryStories.length
                    ?
                    categoryStories
                        .map(renderStory)
                        .join("")
                    :
                    '<div class="empty">No articles right now.</div>';

        });

}

async function buildFeed(){

    const results =
        await Promise.allSettled(
            feeds.map(
                feed =>
                    getFeed(feed)
            )
        );

    const stories =
        results
            .filter(
                result =>
                    result.status === "fulfilled"
            )
            .flatMap(
                result =>
                    result.value
            )
            .filter(
                story =>
                    story &&
                    story.link &&
                    story.title
            );

    window.allStories =
        stories.sort(
            (a,b) =>
                getDateValue(b.published) -
                getDateValue(a.published)
        );

    renderFeed();

}

function setupSearch(){

    const searchInput =
        document.getElementById(
            "article-search"
        );

    if(!searchInput){
        return;
    }

    searchInput.addEventListener(
        "input",
        event => {

            window.searchTerm =
                event.target.value.trim();

            renderFeed();

        }
    );

}

renderSavedArticles();
setupSearch();
buildFeed();
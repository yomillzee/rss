localStorage.removeItem("dismissedArticles");

function getSavedArticles(){

    try{

        return JSON.parse(
            localStorage.getItem(
                "savedArticles"
            ) || "[]"
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

        return JSON.parse(
            localStorage.getItem(
                "dismissedArticles"
            ) || "[]"
        );

    }

    catch(error){

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

function isArticleSaved(link){

    return getSavedArticles().some(
        article => article.link === link
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
            story => story.link === decodedLink
        );

    if(!article){
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

    showToast(
        "Dismissed"
    );

}

window.saveArticle = saveArticle;
window.unsaveArticle = unsaveArticle;

window.dismissArticle =
    dismissArticle;

window.allStories = [];

window.searchTerm = "";

async function getFeed(feed){

    try{

        const endpoint =
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=50`;

        const response =
            await fetch(endpoint);

        const data =
            await response.json();

        return (data.items || []).map(item => ({

            category: feed.category,
            source: feed.name,
            title: item.title,
            link: item.link,

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

    return `

    <div class="story">

${
    story.thumbnail
    ?
    `
    <img
        class="story-thumb"
        src="${story.thumbnail}"
        alt=""
        loading="lazy"
    >
    `
    :
    ""
}

        <div class="category">
            ${story.category}
        </div>

        <div class="title">
            <a href="${story.link}" target="_blank">
                ${story.title}
            </a>
        </div>

        <div class="meta">
            ${story.source}
        </div>

        ${
            story.published
            ?
            `
            <div class="published">
                ${formatDate(
                    story.published
                )}
            </div>
            `
            :
            ""
        }

       <div class="summary">
    ${(story.summary || "")
        .substring(0,250)}...
</div>

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
        saved.map(article => `

            <div class="story">

                <div class="category">
                    ${article.category}
                </div>

                <div class="title">
                    <a href="${article.link}" target="_blank">
                        ${article.title}
                    </a>
                </div>

                <div class="meta">
                    ${article.source}
                </div>

                ${
                    article.published
                    ?
                    `
                    <div class="published">
                        ${formatDate(
                            article.published
                        )}
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

        `).join("");

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

const dismissed =
    getDismissedArticles();

const visibleStories =
    window.allStories
        .filter(
            story =>
                !dismissed.includes(
                    story.link
                )
        )
        .filter(
            story => {

                if(
                    !window.searchTerm
                ){
                    return true;
                }

                const search =
                    window.searchTerm
                        .toLowerCase();

                return (
                    story.title
                        .toLowerCase()
                        .includes(search)
                    ||
                    story.source
                        .toLowerCase()
                        .includes(search)
                    ||
                    (story.summary || "")
    .toLowerCase()
    .includes(search)
                );

            }
        );

if(topFeed){

    const newestStories =
    [...visibleStories]
            .sort(
                (a,b) =>
                    new Date(
                        b.published || 0
                    ) -
                    new Date(
                        a.published || 0
                    )
            )
            .slice(0,10);

    topFeed.innerHTML =
        newestStories
            .map(
                story =>
                    renderStory(
                        story
                    )
            )
            .join("");

}

    Object.keys(sections)
    .forEach(category => {

        const target =
            sections[category];

        const categoryStories =
            visibleStories
                .filter(
                    story =>
                        story.category === category
                )
                .slice(0,10);

        categoryStories
            .forEach(story => {

                target.innerHTML +=
                    renderStory(
                        story
                    );

            });

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
                r =>
                    r.status === "fulfilled"
            )
            .flatMap(
                r =>
                    r.value
            );

    window.allStories =
    stories.sort(
        (a,b) =>
            new Date(
                b.published || 0
            ) -
            new Date(
                a.published || 0
            )
    );

const counts = {};

stories.forEach(story => {

    counts[story.category] =
        (counts[story.category] || 0) + 1;

});

alert(
    JSON.stringify(
        counts,
        null,
        2
    )
);
renderFeed();
}

const searchInput =
    document.getElementById(
        "article-search"
    );

if(searchInput){

    searchInput.addEventListener(
        "input",
        event => {

            window.searchTerm =
                event.target.value;

            renderFeed();

        }
    );

}

renderSavedArticles();
buildFeed();
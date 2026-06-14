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

window.saveArticle = saveArticle;
window.unsaveArticle = unsaveArticle;

window.allStories = [];

async function getFeed(feed){

    try{

        const endpoint =
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;

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
            ${story.summary.substring(
                0,
                250
            )}...
        </div>

        ${renderSaveButton(story)}

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

if(topFeed){

    const newestStories =
        [...window.allStories]
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

    window.allStories.forEach(story => {

        const target =
            sections[
                story.category
            ];

        if(target){

            target.innerHTML +=
                renderStory(
                    story
                );

        }

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
renderFeed();
}

renderSavedArticles();
buildFeed();
function saveArticle(link){

    const article =
        window.allStories.find(
            story => story.link === link
        );

    if(!article){
        return;
    }

    const saved =
        JSON.parse(
            localStorage.getItem(
                "savedArticles"
            ) || "[]"
        );

    const exists =
        saved.some(
            item =>
                item.link === article.link
        );

    if(exists){
        return;
    }

    saved.unshift(article);

    localStorage.setItem(
        "savedArticles",
        JSON.stringify(saved)
    );

    renderSavedArticles();

    alert("Saved!");

}

window.saveArticle = saveArticle;

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

        <button
            class="save-btn"
            onclick="saveArticle('${story.link}')"
        >
            ⭐ Save
        </button>

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
        JSON.parse(
            localStorage.getItem(
                "savedArticles"
            ) || "[]"
        );

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

            </div>

        `).join("");

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
        stories;

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

    stories.forEach(story => {

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

renderSavedArticles();
buildFeed();
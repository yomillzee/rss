
function saveArticle(link){

    const saved =
        JSON.parse(
            localStorage.getItem("savedArticles")
            || "[]"
        );

    if(!saved.includes(link)){

        saved.unshift(link);

        localStorage.setItem(
    "savedArticles",
    JSON.stringify(saved)
);

renderSavedArticles();

alert("Saved!");
    }

}

window.saveArticle = saveArticle;

async function getFeed(feed){

    try{

        const endpoint =
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;

        const response =
            await fetch(endpoint);

        const data =
            await response.json();

        return (data.items || []).map(item => ({

            category:feed.category,
            source:feed.name,
            title:item.title,
            link:item.link,

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
                    r.status ===
                    "fulfilled"
            )
            .flatMap(
                r =>
                    r.value
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
        .forEach(
            el =>
                el.innerHTML = ""
        );

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

function renderSavedArticles(){

    const container =
        document.getElementById(
            "saved-feed"
        );

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
        saved
            .map(link => `
                <div class="story">
                    <a href="${link}" target="_blank">
                        ${link}
                    </a>
                </div>
            `)
            .join("");

}

renderSavedArticles();
buildFeed();

renderSavedArticles();
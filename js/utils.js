function stripHtml(html){

    const div =
        document.createElement("div");

    div.innerHTML = html;

    return div.textContent ||
           div.innerText ||
           "";

}

function formatDate(dateString){

    if(!dateString) return "";

    try{

        const date =
            new Date(dateString);

        if(!isNaN(date)){

            return date.toLocaleDateString(
                undefined,
                {
                    month:"short",
                    day:"numeric",
                    year:"numeric"
                }
            );

        }

        const datePart =
            dateString.split(" ")[0];

        const [year,month,day] =
            datePart.split("-");

        const fallbackDate =
            new Date(
                Number(year),
                Number(month)-1,
                Number(day)
            );

        if(!isNaN(fallbackDate)){

            return fallbackDate.toLocaleDateString(
                undefined,
                {
                    month:"short",
                    day:"numeric",
                    year:"numeric"
                }
            );

        }

        return dateString;

    }

    catch(error){

        console.error(
            "Date formatting error:",
            dateString,
            error
        );

        return dateString;

    }

}
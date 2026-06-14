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

        if(dateString.includes("00:00:00")){

            const [datePart] =
                dateString.split(" ");

            const [year,month,day] =
                datePart.split("-");

            const date =
                new Date(
                    Number(year),
                    Number(month)-1,
                    Number(day)
                );

            return date.toLocaleDateString(
                undefined,
                {
                    month:"short",
                    day:"numeric",
                    year:"numeric"
                }
            );

        }

        const [datePart,timePart] =
            dateString.split(" ");

        if(datePart && timePart){

            const [year,month,day] =
                datePart.split("-");

            const [hour,minute] =
                timePart.split(":");

            const date =
                new Date(
                    Number(year),
                    Number(month)-1,
                    Number(day),
                    Number(hour),
                    Number(minute)
                );

            return (
                date.toLocaleDateString(
                    undefined,
                    {
                        month:"short",
                        day:"numeric",
                        year:"numeric"
                    }
                )
                +
                " • "
                +
                date.toLocaleTimeString(
                    undefined,
                    {
                        hour:"numeric",
                        minute:"2-digit"
                    }
                )
            );

        }

        return dateString;

    }

    catch{

        return dateString;

    }

}
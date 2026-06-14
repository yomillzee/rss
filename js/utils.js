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

        let date;

        if(dateString.includes(" ")){

            const [datePart] =
                dateString.split(" ");

            const [year,month,day] =
                datePart.split("-");

            date = new Date(
                Number(year),
                Number(month)-1,
                Number(day)
            );

        } else {

            date = new Date(dateString);

        }

        return date.toLocaleDateString(
            undefined,
            {
                month:"short",
                day:"numeric",
                year:"numeric"
            }
        );

    }

    catch{

        return dateString;

    }

}
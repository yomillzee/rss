function formatDate(dateString){

    if(!dateString) return "";

    const datePart =
        dateString.split(" ")[0];

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
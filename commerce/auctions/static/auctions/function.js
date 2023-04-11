function list_direct(e) {
    console.log(e);
}

function closeList(list) {
    const data = {
        list: list,
        status: 'close',
    };
    fetch('/delete',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
        },
        body: JSON.stringify(data),
    })}

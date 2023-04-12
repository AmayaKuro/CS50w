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
    });
}

function watchListState(element, isWatched) {
    if (isWatched) {
        element.classList.remove("btn-success");
        element.classList.add("btn-danger");
    }
    else {
        element.classList.remove("btn-danger");
        element.classList.add("btn-success");
    }
}

function watchList(element, list, purpose) {
    const data = {
        list: list,
        purpose: purpose,
    };
    fetch('/watchlist/modify',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
        },
        body: JSON.stringify(data),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data["status"] === 0) {
            throw new Error('Unable to excute request');
        }
        if (purpose === "change") {
            watchListState(element, data["state"])
        } 
        else {
            currentState = element.classList.contains("btn-success")
            watchListState(element, currentState)
        }
    }).catch(console.error);
}

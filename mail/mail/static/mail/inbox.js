document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Add event listener
  document.querySelector('#compose-form').addEventListener('submit', sendEmail);

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


async function sendEmail(e) {
  // Stop form from submitting
  e.preventDefault();
  // Get data of email send
  email = {
    "sender": e.target.elements.sender.value,
    "recipients": e.target.elements.recipients.value,
    "subject": e.target.elements.subject.value,
    "body": e.target.elements.body.value,
  }

  // Send email to server
  const responne = await fetch("/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
  });
  const data = await responne.json();

  // Pop up message respone to user 
  if ("error" in data) {
    PopUpMessage("error", data.error);
  }
  else if ("message" in data) {
    PopUpMessage("success", data.message);
    load_mailbox('sent');
  }
}


function PopUpMessage(type, message) {
  const popUp = document.querySelector("#popUp");

  popUp.classList.remove("success", "error", "popUp");
  console.log(type.search(" "))
  setTimeout(function () { popUp.classList.add(type, "popUp");  }, 50);

  popUp.querySelector("strong").innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
  popUp.querySelector("p").innerHTML = message;
}
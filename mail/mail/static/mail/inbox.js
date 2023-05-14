function main() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Add event listener
  document.querySelector('#compose-form').addEventListener('submit', sendEmail);

  // By default, load the inbox
  load_mailbox('inbox');
};

document.addEventListener("DOMContentLoaded", () => main());


function compose_email(data) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  let fields = {
    recipients: document.querySelector('#compose-recipients'),
    subject: document.querySelector('#compose-subject'),
    body: document.querySelector('#compose-body'),
  }

  // If it is a reply, fill in the fields
  // else clear out composition fields
  if ("reply" in data) {
    fields.recipients.value = data.mail.sender;
    fields.subject.value = "Re: " + data.mail.subject.replace(/^Re: /g, "");
    fields.body.value = `\n\nOn ${data.mail.timestamp} ${data.mail.sender}, wrote: ` + data.mail.body;
    fields.body.selectionStart = fields.body.selectionEnd = 0;
    fields.body.focus();
  }
  else {
    fields.recipients.value = '';
    fields.subject.value = '';
    fields.body.value = '';
  }
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#content').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails from server
  getEmails(mailbox).then(emails => {
    // Pop up error message if the call doesn't success
    if ("error" in emails) {
      PopUpMessage("error");
    }
    // esle display requested mail box
    else {
      emails.forEach(loadEmails);;
    }
  });
}


function loadEmails(email) {
  // Create email holder
  let element = document.createElement("div");
  element.classList.add("holder");
  if (email.read) {
    element.classList.add("read");
  }
  element.addEventListener("click", () => loadEmail(email.id));

  //Create components
  let sender = document.createElement("b");
  sender.classList.add("sender");
  sender.innerHTML = email.sender;

  let subject = document.createElement("span");
  subject.classList.add("subject");
  subject.innerHTML = email.subject;

  let timestamp = document.createElement("span");
  timestamp.classList.add("timestamp");
  timestamp.innerHTML = email.timestamp;

  // Add together all the components
  element.appendChild(sender);
  element.appendChild(subject);
  element.appendChild(timestamp);

  // Add email to screen
  const view = document.querySelector("#emails-view");
  view.appendChild(element);
}


// Render email of choice
function loadEmail(id) {
  document.querySelector('#content').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';

  getEmails(id).then(mail => {
    loadContent(mail)
  }).catch(err => {
    PopUpMessage("error", err);
  });

  emailState(id, { read: true });
}


function loadContent(mail) {
  let subject = document.createElement("span");
  subject.setAttribute("id", "view-subject");
  subject.innerHTML = mail.subject;

  let info = document.createElement("div");
  info.setAttribute("id", "info");

  let sender = document.createElement("b");
  sender.setAttribute("id", "view-sender");
  sender.innerHTML = "From: " + mail.sender;

  let recipients = document.createElement("span");
  recipients.setAttribute("id", "view-recipents");
  recipients.innerHTML = "To: " + mail.recipients;

  let timestamp = document.createElement("span");
  timestamp.setAttribute("id", "timestamp");
  timestamp.innerHTML = mail.timestamp

  let body = document.createElement("div");
  body.setAttribute("id", "view-body");
  body.innerHTML = mail.body;

  // TODO: add archive button or unarchive
  let archive = document.createElement("a");
  archive.setAttribute("id", "archive");
  if (mail.archived) {
    archive.setAttribute("class", "archived");
  }
  archive.onclick = (e) => archiveState(mail.id, e.target);
  archive.innerHTML = "Archive";

  // TODO: add reply button
  let reply = document.createElement("a");
  reply.setAttribute("id", "reply");
  reply.onclick = () => compose_email({
    reply: true,
    mail: mail,
  });
  reply.innerHTML = "Reply";


  // Add components of the email for view
  subject.appendChild(archive);

  info.appendChild(timestamp);
  info.appendChild(sender);
  info.appendChild(recipients);

  const view = document.querySelector("#content");
  // Reset email view
  view.innerHTML = ""

  view.appendChild(subject);
  view.appendChild(info);
  view.appendChild(body);
  view.appendChild(reply);
}


function PopUpMessage(type, message) {
  const popUp = document.querySelector("#popUp");

  popUp.classList.remove("success", "error", "popUp");
  setTimeout(function () { popUp.classList.add(type, "popUp"); }, 50);

  popUp.querySelector("strong").innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
  popUp.querySelector("p").innerHTML = message;
}


async function sendEmail(e) {
  // Stop form from submitting
  e.preventDefault();
  // Get data of email send
  let email = {
    "sender": e.target.elements.sender.value,
    "recipients": e.target.elements.recipients.value,
    "subject": e.target.elements.subject.value,
    "body": e.target.elements.body.value,
  };

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
};


async function getEmails(requires) {
  const responne = await fetch(`/emails/${requires}`);
  return await responne.json();
}


async function emailState(id, state) {
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify(state)
  });
}


async function archiveState(id, element) {
  state = element.classList.contains("archived");
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !state,
    })
  }).then(() => {
    if (state) {
      element.classList.remove("archived");
      element.innerHTML = "Archived"
    }
    else {
      element.classList.add("archived");
      element.innerHTML = "Unarchived"
    }
  });
}
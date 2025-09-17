# process nodes

form
    form_field: text
    form_label: Name
    form_value: randomUser

    form_field: text
    form_label: email
    form_value: example@gmail.com

gmail
    to_send: Hello you are accepted
    to: form_value[2]
    subject: Message
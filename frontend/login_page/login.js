const form = document.getElementById("form");

function access_denied()
{
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = "Invalid username or password.";
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("toast--show"));

    setTimeout(() => {
        toast.classList.remove("toast--show");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
}

function server_error()
{
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = "Server Error";
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("toast--show"));

    setTimeout(() => {
        toast.classList.remove("toast--show");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 3000);
}

async function redirect(name, pass)
{
    if(!name || !pass)
    {
        access_denied();
    }

    try {
        const response = await fetch("https://website-backend-production-ac2b.up.railway.app/public/login_page", {
            method: "POST", 
            headers: {"content-type" : "application/json"}, 
            body: JSON.stringify({name : name, pass : pass})
        });

        const result = await response.json();

        if(result.success === 1)
        {
            window.location.href = "../admin_you_cant_guess_this/index.html";
        }
        else
        {
            access_denied();
        }
    }
    catch (err)
    {
        console.log("Error : " + err);
        server_error();
    }
}

form.addEventListener("submit", e => {
    e.preventDefault();

    const data = new FormData(form);
    redirect(data.get("name"), data.get("pass"));
    form.reset();

});

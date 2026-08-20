const menu = document.getElementById("menu_display");
const nav = document.getElementById("admin");

function add_categories(cats)
{
    cats.forEach(e => {
        if(e.C_isAvail == 1)
            {
            const field = document.createElement("fieldset");
            field.classList.add("categories");
            field.id = e.C_id;
            const leg = document.createElement("legend");
            leg.innerText = e.C_name;
            field.append(leg);
            menu.append(field);
        }
    });
};

function add_items(items, categories)
{
    categories.forEach(e => {
    const list_id = e.C_id;
    const list_items = items.filter(item => item.cat_id === list_id);
    const category = document.getElementById(list_id);
    
    if(e.C_isAvail == 1 && category)
        {
            list_items.forEach(f => {
                if(f.I_isAvail)
                {
                    const div = document.createElement("div");
                    div.id = f.I_id;

                    const name_p = document.createElement("p");
                    name_p.innerText = f.I_name;

                    const price_p = document.createElement("p");
                    price_p.innerText = "Rs " + f.I_price;

                    div.append(name_p, price_p);
                    category.append(div);
                }
            });
        }
    });
};

async function load_data()
{
    const responce = await fetch("https://website-backend-production-ac2b.up.railway.app");
    const data = await responce.json();

    add_categories(data.categories);
    add_items(data.items, data.categories);
}

load_data();
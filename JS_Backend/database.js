import database from "better-sqlite3" ;
const db = new database("menu.db");
export default db;

try {
    db.exec(
        `create table if not exists categories (C_id text primary key, C_name text, C_isAvail boolean)`,
    );
    console.log("Categories Tables Created.");
    db.exec(
        `create table if not exists items (I_id text unique, I_name text, I_price integer, I_isAvail boolean, cat_id text, foreign key (cat_id) references categories(C_id) )`,
    );
    console.log("Items Tables Created.");
} catch (err) {
    console.log("Error : ", err);
}

export function get_menu()
{
    return {
        categories : db.prepare(`SELECT * FROM categories`).all(),
        items : db.prepare(`SELECT * FROM items`).all()
    };
}

const updateC = db.prepare(`UPDATE categories SET C_name = ?, C_isAvail = ? WHERE C_id = ?`);
export function update_category(name, avail, id)
{
    updateC.run(name, avail ? 1 : 0, id);
}

const updateI = db.prepare(`UPDATE items SET I_name = ?, I_price = ?, I_isAvail = ? WHERE I_id = ?`);
export function update_item(name, price, avail, id)
{
    updateI.run(name, price, avail ? 1 : 0, id);
}

const addC = db.prepare(`INSERT INTO categories (C_id, C_name, C_isAvail) VALUES (?, ?, ?)`);
export function add_category(name, avail)
{
    addC.run(crypto.randomUUID(), name, avail ? 1 : 0);
}

const addI = db.prepare(`INSERT INTO items (I_id, I_name, I_price, I_isAvail, cat_id) VALUES (?, ?, ?, ?, ?)`);
export function add_item(name, price, avail, cat_id)
{
    addI.run(crypto.randomUUID(), name, price, avail ? 1 : 0, cat_id);
}

const deleteC = db.prepare(`DELETE FROM categories WHERE C_id = ?`);
const deleteC_items = db.prepare(`DELETE FROM items WHERE cat_id = ?`);
export function delete_category(id)
{
    deleteC_items.run(id);
    deleteC.run(id);
}

const deleteI = db.prepare(`DELETE FROM items WHERE I_id = ?`);
export function delete_item(id)
{
    deleteI.run(id);
}


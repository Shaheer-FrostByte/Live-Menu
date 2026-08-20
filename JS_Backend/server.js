import http from "http";
import db, {
    get_menu,
    update_category,
    update_item,
    add_category,
    add_item,
    delete_category,
    delete_item,
} from "./database.js";

const Name = "user";
const Password = "user123";

function send_res(res, status_code, data) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = status_code;
    res.write(JSON.stringify(data));
    res.end();
}

function parse_body(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => { body += chunk; });
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch {
                reject(new Error("Invalid JSON"));
            }
        });
        req.on("error", reject);
    });
}

const server = http.createServer(async (req, res) => {
    try {
        console.log(req.method, req.url);

        if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.statusCode = 204;
        res.end();
        return;
        } else if (req.method === "GET") {
            send_res(res, 200, get_menu());
        } else if (req.method === "POST" && req.url === "/public/admin") {
            const data = await parse_body(req);

            if (data.for_item) {
                add_item(data.name, data.price, data.isAvail, data.cat_id);
            } else {
                add_category(data.name, data.isAvail);
            }
            send_res(res, 200, {success: true});
        } else if (req.method === "PUT" && req.url === "/public/admin") {
            const data = await parse_body(req);

            if (data.for_item) {
                update_item(data.name, data.price, data.isAvail, data.id);
            } else {
                update_category(data.name, data.isAvail, data.id);
            }
            send_res(res, 200, {success: true});
        } else if (req.method === "DELETE" && req.url === "/public/admin") {
            const data = await parse_body(req);

            if (data.for_item) {
                delete_item(data.id);
            } else {
                delete_category(data.id);
            }
            send_res(res, 200, {success: true});
        } else if (req.method === "POST" && req.url === "/public/login_page") {
            const data = await parse_body(req);

            if (
                data.name.trim().toLowerCase() === Name.trim().toLowerCase() &&
                data.pass.trim() === Password.trim()
            ) {
                send_res(res, 200, {success: 1});
            } else {
                send_res(res, 200, {success: 0});
            }
        }
        else 
        {
            send_res(res, 404, {error: "Not Found"});
        }
    } catch (err) {
        console.error("Server error : ", err.message);
        const status = err.message === "Invalid JSON" ? 400 : 500;
        send_res(res, status, {error : err.message});
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}.`);
});

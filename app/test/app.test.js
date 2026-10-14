const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../server");

function fakeDatabase() {
  let tasks = [];
  let nextId = 1;

  return {
    async query(sql) {
      if (sql === "SELECT 1") {
        return [[{ 1: 1 }]];
      }

      if (sql.includes("FROM tasks")) {
        return [[...tasks]];
      }

      throw new Error("Unexpected query");
    },

    async execute(sql, values) {
      if (sql.startsWith("INSERT")) {
        tasks.push({
          id: nextId++,
          title: values[0],
          description: values[1],
          status: values[2],
          created_at: new Date()
        });

        return [{ affectedRows: 1 }];
      }

      if (sql.startsWith("UPDATE")) {
        const [title, description, status, id] = values;
        const task = tasks.find(t => t.id === id);

        if (!task) return [{ affectedRows: 0 }];

        Object.assign(task, { title, description, status });
        return [{ affectedRows: 1 }];
      }

      if (sql.startsWith("DELETE")) {
        const id = values[0];
        const before = tasks.length;
        tasks = tasks.filter(t => t.id !== id);

        return [{ affectedRows: before - tasks.length }];
      }

      throw new Error("Unexpected execute");
    }
  };
}

test("health endpoint reports a working database", async () => {
  const app = createApp(fakeDatabase());

  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("create and read a task", async () => {
  const app = createApp(fakeDatabase());

  const created = await request(app)
    .post("/tasks")
    .type("form")
    .send({ title: "Learn Terraform", description: "AWS infrastructure" });

  assert.equal(created.status, 302);

  const response = await request(app).get("/");

  assert.equal(response.status, 200);
  assert.match(response.text, /Learn Terraform/);
});

test("reject a task with an empty title", async () => {
  const app = createApp(fakeDatabase());

  const response = await request(app)
    .post("/tasks")
    .type("form")
    .send({ title: "   " });

  assert.equal(response.status, 400);
});

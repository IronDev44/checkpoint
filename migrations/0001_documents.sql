CREATE TABLE IF NOT EXISTS documents (
  owner TEXT NOT NULL,
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL CHECK(json_valid(data)),
  PRIMARY KEY(owner,collection,id)
);

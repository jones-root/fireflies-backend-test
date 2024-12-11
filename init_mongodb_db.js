db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

// Grant local mongo container root user permission to MONGO_INITDB_DATABASE
db.createUser({
	user: process.env.MONGO_INITDB_ROOT_USERNAME,
	pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
	roles: [{ role: "readWrite", db: process.env.MONGO_INITDB_DATABASE }],
});

console.log(
	`User ${process.env.MONGO_INITDB_ROOT_USERNAME} configured for ${process.env.MONGO_INITDB_DATABASE} database`,
);

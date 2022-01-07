db = db.getSiblingDB('admin');
db.auth("autonomous", "Ftk7N68pUib6LV");
db = db.getSiblingDB('lambda_backend_service');
db.createUser(
  {
      user: "lambda",
      pwd: "nXZv5uM4JMyDYv2c",
      roles: [
          {
              role: "readWrite",
              db: "lambda_backend_service"
          }
      ]
  }
);

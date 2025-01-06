// Creating Db Name
const DB_NAME = "Pizza-Max";

// User Roles
const userRoles = ["user", "admin"];

// Creating cookies options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
};

export { DB_NAME, userRoles, COOKIE_OPTIONS };

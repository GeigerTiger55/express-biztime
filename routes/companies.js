/** Routes for companies */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** GET /
 * - Returns a list of companies:
 *    {companies: [{code, name}, ...]}
 */
router.get("/", async function (req, res) {
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ "companies": companies });
});


/** GET  /[code]
 * - Accepts code in url parameter
 * - Returns object of a single company:
 *    {company: {code, name, description}}
*/
router.get("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description FROM companies WHERE code = $1`,
    [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No company matching code: ${code}`);

  return res.json({ "company": company });
});


/** POST /
 * - Accepts JSON:
 *    {code, name, description}
 * - Returns object of new company:
 *    {company: {code, name, description}}
 */
//TODO: should we check if these input values are valid
router.post("/", async function (req, res) {

  const newCompanyData = [
    req.body.code,
    req.body.name,
    req.body.description,
  ];

  const results = await db.query(
    `INSERT INTO companies (code, name, description)
         VALUES ($1, $2, $3)
         RETURNING code, name, description`,
    newCompanyData);
  const company = results.rows[0];

  return res.status(201).json({ "company": company });
});


/** PUT /[code] - update all fields in company;
 * - Returns updated company:
 * `{company: {code, name, description}}` */

router.put("/:code", async function (req, res) {
  if ("code" in req.body) throw new BadRequestError("Not allowed");

  const code = req.params.code;

  const updatedName = req.body.name;
  const updatedDescription = req.body.description;

  const results = await db.query(
    `UPDATE companies
         SET name=$1, description=$2
         WHERE code = $3
         RETURNING code, name, description`,
    [updatedName, updatedDescription, code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ company: company });
});


/** DELETE /[code] - deletes company
 * - Returns json if company code found:
 *  {status: "deleted"}
 * - Returns 404 error if company cpde not found
*/
router.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    "DELETE FROM companies WHERE code = $1 RETURNING code", [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company: ${code}`);
  return res.json({ status: "deleted" });
});

module.exports = router;
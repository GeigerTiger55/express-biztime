/** Routes for companies */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/** GET / 
 * - Returns a list of companies:
 *    {companies: [{code, name}, ...]}
 */
router.get("/", async function(req, res) {
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ "companies": companies });
});



/** GET  /[code] 
 * - Accepts code in url parameter
 * - Returns object of a single company:
 *    {company: {code, name, description}}
*/
router.get("/:code", async function(req, res) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name FROM companies WHERE code = $1`,
    [code]);
  const company = results.rows[0];

  if(!company) throw new NotFoundError(`No company matching code: ${code}`);

  return res.json({ "company": company });
});


/** POST / 
 * - Accepts JSON:
 *    {code, name, description}
 * - Returns object of new company:
 *    {company: {code, name, description}}
 */


module.exports = router;
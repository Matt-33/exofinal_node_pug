const dayjs = require("dayjs");
const localizedFormat = require("dayjs/plugin/localizedFormat");
require("dayjs/locale/fr");

dayjs.extend(localizedFormat);
dayjs.locale("fr");

function formatFrenchDate(dateStr) {
	const [year, day, month] = dateStr.split("-");
	if (!year || !day || !month) return dateStr;
	const fixedDate = `${year}-${month}-${day}`;
	return dayjs(fixedDate).format("DD/MM/YYYY");
}

module.exports = { formatFrenchDate };

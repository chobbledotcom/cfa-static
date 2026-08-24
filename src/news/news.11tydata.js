import { linkableContent } from "#utils/linkable-content.js";

export default linkableContent("news", {
  date: (data) => data.page.date,
});

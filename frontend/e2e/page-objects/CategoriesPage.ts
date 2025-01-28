import HelperBase from "./helperBase"

export default class CategoriesPage extends HelperBase {
  private readonly categoriesLink = this.page.getByRole("link", {
    name: "Categories",
  })

  async navigateToCategoriesPage() {
    await this.categoriesLink.click()
  }
}

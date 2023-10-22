describe("This is a simple Test",() => {
    it("visit the app root url", () => {
        cy.visit("/", { timeout: 80000 })
        cy.contains('이야기 만들기')
        cy.contains('이야기 불러오기')
    })
})


describe("HireFlow — Job Seeker Auth Flow", () => {
  
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const password = "test1234";

  it("shows the homepage hero section", () => {
    cy.visit("/");
    cy.contains("HireFlow").should("be.visible");
    cy.contains("Land your dream Job").should("be.visible");
  });

  it("lets a new job seeker sign up", () => {
    cy.visit("/login?mode=signup");


    cy.get('input[placeholder="First name"]').type("Test");
    cy.get('input[placeholder="Last name"]').type("User");
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type(password);

    
    cy.on("window:alert", (msg) => {
      expect(msg).to.contain("Account created");
    });

    cy.contains("button", "Create account").click();

    
    cy.contains("Have account?").should("be.visible");
  });

  it("logs the new job seeker in and lands on the dashboard", () => {
    cy.visit("/login");

    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "Log in").click();

    
    cy.url({ timeout: 10000 }).should("include", "/dashboard");
    cy.contains("Test User").should("be.visible");
  });

  it("shows an error for wrong password", () => {
    cy.visit("/login");
    cy.get('input[type="email"]').type(uniqueEmail);
    cy.get('input[type="password"]').type("wrongpassword");
    cy.contains("button", "Log in").click();

    cy.contains(/Incorrect email or password/i, { timeout: 10000 }).should("be.visible");
  });
});

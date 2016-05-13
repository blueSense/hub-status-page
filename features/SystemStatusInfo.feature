Feature: System status information
  As a client
  I want to be able to go to a status page for a device
  So that I can see information about the hub

  The system information includes the following:
  - hostname
  - network information (IP address and interfaces)
  - current application image
  - update status: last update and mark if any in progress

  Scenario: Gather system information
    Given I am on the status page
    Then I should be able to see the system information

  Scenario: System information changes
    Given I am on the status page
    When the system information changes
    Then I should be able to see updated system information

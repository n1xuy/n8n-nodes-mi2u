# n8n-nodes-mi2u

This is an n8n community node. It provides a set of nodes to interact with the Mi2u service, allowing you to manage inboxes and messages programmatically.

[n8n](https://n8n.io/) is a fair-code licensed workflow automation tool.

## Nodes

The `n8n-nodes-mi2u` package includes the following nodes:

- **Mi2u**: Login to ICS and get a session cookie.
- **Mi2u Create**: Create a new invoice to ICS with your ICS account.
- **Mi2u Decoder**: Decode a base 64 string to json content.
- **Mi2u Search**: Search for specific invoices by providing TIN and document number (Only for created invoice in ICS).

## Installation

Follow the installation guide in the [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/installation/).

## Usage Example: Invoice Processing Workflow

This example demonstrates a common workflow for processing an invoice file, authenticating with the Mi2u service, creating an invoice, and verifying its creation.

1.  **Authentication (`Mi2u` node)**: Begin the workflow by using the `Mi2u` node with your credentials to authenticate with the service. It's important to handle both successful and failed login attempts, which can be done using an `IF` node following this step.

2.  **Create Invoice (`Mi2u Create` node)**: After a successful login, pass your invoice data to the `Mi2u Create` node. This data might come from a file received in a trigger step (e.g., Telegram, Email).

3.  **Verify Invoice (`Mi2u Search` node)**: Once the invoice is created, use the `Mi2u Search` node to look up the invoice you just created. This helps confirm that the invoice was successfully submitted and allows you to retrieve its details.

4.  **Decode Response (`Mi2u Decoder` node)**: Take the response from the `Mi2u Search` node and pass it to the `Mi2u Decoder` node. This can be used to decode a Base64 encoded string within the response or to extract specific details from the JSON object for use in later steps of your workflow.

## License

[MIT](LICENSE.md)

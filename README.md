# n8n-nodes-mi2u

Custom n8n community nodes for MI2U invoice integration with ICS (Invoice Clearance System). This package provides seamless integration with Malaysia's e-invoice system through MI2U's API.

![n8n](https://img.shields.io/badge/n8n-Community%20Node-FF6D5A)
![npm](https://img.shields.io/npm/v/n8n-nodes-mi2u)
![License](https://img.shields.io/npm/l/n8n-nodes-mi2u)

## 🚀 Installation

To install this community node package in n8n:

### Option 1: Via n8n Community Nodes (Recommended)
1. Go to **Settings** → **Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Enter: `n8n-nodes-mi2u`
4. Click **Install**

### Option 2: Via npm
```bash
npm install n8n-nodes-mi2u
```

### Option 3: Manual Installation
```bash
# In your n8n installation directory
npm install n8n-nodes-mi2u
# Restart n8n
```

## 📦 Nodes Included

### 🔐 Mi2u Login Token
**Purpose**: Authenticate with MI2U API and retrieve session tokens

**Features**:
- Secure authentication with username/password
- Returns session cookie for subsequent API calls
- Input validation and error handling
- Base64 encoding for secure credential transmission

**Use Case**: This should be the first node in any MI2U workflow to establish authentication.

### 🔍 Mi2u Search Invoice
**Purpose**: Search for existing invoices in the ICS system

**Features**:
- Search invoices by various criteria
- TIN-based invoice lookup
- Date range filtering
- Comprehensive invoice data retrieval

**Use Case**: Query and retrieve existing invoice data from the ICS system for reporting or verification purposes.

### 📄 Mi2u Pass to ICS
**Purpose**: Create and submit new invoices to the ICS system

**Features**:
- Complete Malaysian e-invoice compliance
- Support for both B2B and B2C scenarios
- Comprehensive invoice line items
- Tax calculations and classifications
- Supplier and buyer information handling
- LHDN-compliant data structure
- Automatic JSON encoding and API submission

**Use Case**: Submit new invoices for processing and compliance with Malaysian e-invoice regulations.

## 🔑 Required Credentials

This package requires the **Mi2u API** credential with the following fields:

| Field | Description | Example |
|-------|-------------|---------|
| **API URL** | Base URL of your MI2U API endpoint | `https://api.mi2u.com.my` |
| **Username** | Your MI2U account username | `your-username` |
| **Password** | Your MI2U account password | `your-password` |

### Setting up Credentials:
1. In n8n, go to **Credentials** → **Add Credential**
2. Search for **Mi2u API**
3. Fill in your API URL, username, and password
4. Test the connection
5. Save the credential

## 🔄 Example Workflows

### Basic Invoice Creation Workflow
```
1. Mi2u Login Token → 2. Mi2u Pass to ICS
```

### Complete Invoice Management Workflow
```
1. Mi2u Login Token → 2. Mi2u Search Invoice → 3. Mi2u Pass to ICS
```

### Workflow Steps:

1. **Authentication**: Start with "Mi2u Login Token" to get session cookie
2. **Search (Optional)**: Use "Mi2u Search Invoice" to check existing invoices
3. **Create**: Use "Mi2u Pass to ICS" to submit new invoices

## 📋 Invoice Data Requirements

### Supplier Information (Required)
- Company name and registration details
- Address and contact information
- TIN (Tax Identification Number)
- Business registration number

### Buyer Information
- Company/individual details
- Address information
- TIN (for B2B transactions)

### Invoice Details
- Invoice number and date
- Currency and exchange rates
- Line items with descriptions
- Tax calculations
- Payment terms

## 🇲🇾 Malaysian E-Invoice Compliance

This package is specifically designed for **Malaysian e-invoice compliance** and includes:

- ✅ LHDN (Inland Revenue Board) approved data structure
- ✅ MY101 e-invoice specification compliance
- ✅ Proper tax type classifications (01-07)
- ✅ Malaysian state codes (01-17)
- ✅ MSIC industry classification codes
- ✅ Currency and measurement unit codes
- ✅ B2B and B2C transaction support

## 🛠️ Development & Testing

### Prerequisites
- Node.js ≥20.15
- n8n installed locally
- Valid MI2U API credentials

### Local Development
```bash
# Clone the repository
git clone https://github.com/AxiomCode93/n8n-nodes-mi2u.git
cd n8n-nodes-mi2u

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link

# In your n8n directory
npm link n8n-nodes-mi2u
```

### Testing
1. Start n8n locally: `n8n start`
2. Create a new workflow
3. Add Mi2u nodes and configure credentials
4. Test with real API data

## 📚 API Documentation

For detailed API documentation and field specifications, refer to:
- [MI2U API Documentation](https://docs.mi2u.com.my)
- [Malaysian E-Invoice Guidelines](https://www.hasil.gov.my)

## 🐛 Troubleshooting

### Common Issues

**Authentication Failed**
- Verify your API URL, username, and password
- Ensure the API URL includes the protocol (https://)
- Check if your MI2U account is active

**Invoice Submission Errors**
- Validate all required fields are populated
- Check date formats (YYYY-MM-DD)
- Ensure TIN numbers are valid Malaysian format
- Verify currency codes are ISO standard

**Connection Issues**
- Check network connectivity
- Verify API endpoint is accessible
- Ensure firewall allows outbound connections

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
- Use TypeScript for all implementations
- Follow existing code patterns
- Add JSDoc comments for public methods
- Ensure all lint checks pass
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/AxiomCode93/n8n-nodes-mi2u/issues)
- **Documentation**: [GitHub Wiki](https://github.com/AxiomCode93/n8n-nodes-mi2u/wiki)
- **Email**: yongxiang@myinvoice2u.com

## 🏷️ Version History

- **v0.1.0**: Initial release with login, search, and create functionality
- Full Malaysian e-invoice compliance
- Complete LHDN specification support

---

**Made with ❤️ for the Malaysian e-invoice ecosystem**

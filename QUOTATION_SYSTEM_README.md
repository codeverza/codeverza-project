# Codeverza Quotation Management System

## Overview
Professional quotation management system for Codeverza Admin Panel with complete CRUD operations, PDF generation, and client communication features.

## Features

### ✨ Core Features
- **Complete CRUD Operations**: Create, Read, Update, Delete quotations
- **Dynamic Services**: Add multiple services with customizable details
- **Service Templates**: Quick-add templates for common services (Website Development, Domain, Hosting, Email, etc.)
- **Billing Cycles**: One-Time, Monthly, Half-Yearly, Annually
- **Automatic Calculations**: Subtotal, Discount, Tax, Grand Total
- **Status Management**: Draft, Sent, Accepted, Rejected, Expired
- **Search & Filter**: Search by quotation number, client name, email; Filter by status

### 📄 Professional Quotation Design
- **Header**: Codeverza logo, company name, contact details
- **Client Details**: Name, email, phone, company, address
- **Services Table**: Service name, description, quantity, price, billing cycle, total
- **Pricing Summary**: Subtotal, discount, tax, grand total with proper formatting
- **Additional Info**: Payment terms, project timeline, notes, terms & conditions
- **Footer**: Thank you message, company info, social links

### 🎨 PDF Generation
- Professional PDF layout with Codeverza branding
- Multi-page support with page numbers
- Proper formatting and spacing
- Print-optimized design
- Download as PDF with quotation number in filename

### 📱 Sharing Options
- **WhatsApp**: Share quotation details via WhatsApp with pre-filled message
- **Email**: Share via email with mailto link
- **Copy Link**: Copy quotation preview link to clipboard
- **Print**: Print-optimized version with proper styling

### 💾 Firebase Integration
- Cloud Firestore for data storage
- Real-time data sync
- Automatic timestamp management
- Server-side timestamp for consistency

## File Structure

```
src/app/
├── admin/
│   ├── dashboard/
│   │   └── page.js (Updated with Quotations navigation)
│   └── quotations/
│       ├── page.js (List/Dashboard page)
│       ├── quotations.css (All styles)
│       ├── create/
│       │   └── page.js (Create new quotation)
│       ├── edit/
│       │   └── [id]/
│       │       └── page.js (Edit existing quotation)
│       └── preview/
│           └── [id]/
│               └── page.js (Preview, Print, PDF, Share)
├── api/
│   └── quotations/
│       └── route.js (CRUD API endpoints)
```

## API Endpoints

### GET `/api/quotations`
Fetch all quotations or a single quotation by ID
- Query params: `?id=quotationId` (optional)
- Response: `{ success: true, data: [...] }`

### POST `/api/quotations`
Create new quotation
- Body: Quotation data object
- Auto-generates: quotation number, calculations, timestamps
- Response: `{ success: true, data: {...}, message: "Quotation created successfully" }`

### PUT `/api/quotations`
Update existing quotation
- Body: Quotation data with `id` field
- Recalculates: subtotal, discount, tax, total
- Response: `{ success: true, data: {...}, message: "Quotation updated successfully" }`

### DELETE `/api/quotations`
Delete quotation
- Query params: `?id=quotationId`
- Response: `{ success: true, message: "Quotation deleted successfully" }`

## Data Structure

```javascript
{
  quotationNumber: "QT-1234567890",
  
  // Client Details
  clientName: "John Doe",
  clientEmail: "john@example.com",
  clientPhone: "+92 300 1234567",
  clientCompany: "ABC Company", // optional
  clientAddress: "Full address", // optional
  
  // Services
  services: [
    {
      name: "Website Development",
      description: "Custom website design and development",
      quantity: 1,
      price: 50000,
      billingCycle: "One-Time",
      total: 50000
    }
  ],
  
  // Pricing
  subtotal: 50000,
  discount: 10, // percentage
  discountAmount: 5000,
  tax: 5, // percentage
  taxAmount: 2250,
  grandTotal: 47250,
  currency: "PKR",
  
  // Dates
  issueDate: "2026-08-31",
  validityDate: "2026-09-30",
  
  // Additional Info
  paymentTerms: "50% advance, 50% on completion",
  projectTimeline: "2-4 weeks",
  notes: "Additional notes...",
  termsAndConditions: "Terms and conditions text...",
  
  // Status
  status: "Draft", // Draft | Sent | Accepted | Rejected | Expired
  
  // Timestamps
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

## Service Templates

Pre-configured service templates for quick selection:

1. **Website Development** - Custom website design and development - PKR 50,000 (One-Time)
2. **Domain Registration** - .com domain registration - PKR 1,500 (Annually)
3. **Web Hosting** - Shared hosting with SSL - PKR 2,000 (Annually)
4. **Business Email** - Professional email hosting - PKR 500 (Monthly)
5. **SEO Optimization** - On-page and technical SEO - PKR 15,000 (One-Time)
6. **Maintenance & Support** - Monthly website maintenance - PKR 5,000 (Monthly)

## Usage

### Creating a Quotation
1. Navigate to Admin Dashboard → Quotations
2. Click "Create Quotation" button
3. Fill in client details
4. Add services (use templates or custom entries)
5. Set discount and tax percentages (optional)
6. Add payment terms, timeline, notes, and T&C
7. Select status (default: Draft)
8. Click "Create Quotation"

### Editing a Quotation
1. Click "Edit" icon on any quotation
2. Modify required fields
3. Click "Update Quotation"

### Previewing & Sharing
1. Click "Preview" icon on any quotation
2. View professional quotation design
3. Use action buttons:
   - **Edit**: Modify quotation
   - **Copy Link**: Share preview URL
   - **WhatsApp**: Send details via WhatsApp
   - **Email**: Send via email client
   - **Print**: Print quotation
   - **Download PDF**: Generate and download PDF

### Managing Quotations
- **Search**: Type quotation number, client name, or email
- **Filter**: Select status from dropdown
- **Duplicate**: Copy quotation to create new one
- **Delete**: Remove quotation (with confirmation)
- **Statistics**: View total, draft, sent, accepted counts

## Status Management

- **Draft**: Quotation is being prepared
- **Sent**: Quotation sent to client
- **Accepted**: Client accepted the quotation
- **Rejected**: Client rejected the quotation
- **Expired**: Quotation validity period expired

## Styling

### Color Scheme
- Primary: `#2563eb` (Blue)
- Success: `#10b981` (Green)
- Warning: `#fbbf24` (Yellow)
- Danger: `#ef4444` (Red)
- Purple: `#b14cff` (Brand color)

### Responsive Design
- Desktop: Full layout with sidebar navigation
- Tablet: Adjusted grid layouts
- Mobile: Single-column layout with stacked elements

### Print Styles
- Hides action buttons and navigation
- Optimized spacing for A4 paper
- Preserves color styling for professional appearance

## Dependencies

```json
{
  "jspdf": "^latest",
  "jspdf-autotable": "^latest",
  "html2canvas": "^latest",
  "firebase": "^12.12.0",
  "sweetalert2": "^11.26.24",
  "react-icons": "^5.5.0"
}
```

## Firebase Security Rules

Recommended Firestore security rules for quotations collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotations/{quotationId} {
      // Only authenticated admin users can access
      allow read, write: if request.auth != null;
    }
  }
}
```

## Future Enhancements

- [ ] Email automation for sending quotations
- [ ] Client portal for viewing quotations
- [ ] E-signature integration
- [ ] Payment integration
- [ ] Quotation templates customization
- [ ] Multi-currency support with conversion
- [ ] Quotation analytics and insights
- [ ] Export to Excel/CSV
- [ ] Quotation versioning
- [ ] Comments and internal notes

## Support

For issues or questions, contact:
- Website: www.codeverza.com
- Email: info@codeverza.com
- Phone: +92 300 1234567

---

**Built with ❤️ by Codeverza Team**

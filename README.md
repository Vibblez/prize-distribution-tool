# Reward Distribution System

A professional Next.js application for distributing items and currency to recipients with advanced features for data management and validation.

## 🌟 Features

### Item Management
- **Smart Item Selection**: Autocomplete search through available item IDs
- **Batch Operations**: Select multiple items efficiently
- **Real-time Loading**: Asynchronous item loading with retry functionality
- **Visual Feedback**: Badge-based display of selected items with easy removal

### Currency Distribution
- **Multi-Currency Support**: TC (Tournament Credits), CC (Clan Credits), MM (Marble Money)
- **Flexible Amounts**: Numeric validation with minimum value constraints
- **Professional UI**: Clean dropdown and input interface

### Recipient Management
- **Manual Entry**: Individual name input with duplicate detection
- **CSV Import**: Bulk import from CSV files with customizable count limits
- **Smart Validation**: Real-time duplicate name detection with visual warnings
- **Efficient Input**: Space-to-create-new functionality and multi-name paste support

### Data Import & Export
- **CSV Processing**: Automatic parsing and sorting by performance metrics
- **Top Performers**: Configurable import of top N names based on points
- **Data Validation**: Comprehensive error handling and user feedback
- **Backup Options**: Clear confirmation dialogs before data replacement

### User Experience
- **Dark Theme**: Professional dark slate design with PbP brand colors
- **Responsive Design**: Mobile-friendly layout with adaptive grid system
- **Real-time Feedback**: Loading states, progress indicators, and validation messages
- **Accessibility**: Proper contrast ratios and keyboard navigation support

## 🎨 Design System

### Theme
- **Dark Slate Foundation**: Modern dark interface reducing eye strain
- **PbP Brand Integration**: Strategic use of approved PbP colors for accents
- **Professional Typography**: Clean, readable font hierarchy
- **Smooth Animations**: Subtle transitions and micro-interactions

### Color Palette
- **PbP Gray Blue**: `#1F2C3B` - Primary brand color
- **PbP Blue**: `#0080D1` - Interactive elements and focus states
- **PbP Light Blue**: `#78ACE3` - Hover states and secondary accents
- **PbP Green**: `#00D182` - Success actions and confirmations
- **PbP Bright Red**: `#EF4136` - Error states and warnings
- **Slate Colors**: Various slate shades for background and text hierarchy

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nextjs-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Usage Guide

### Basic Workflow

1. **Select Items** (optional)
   - Type in the search box to find item IDs
   - Click suggestions to add items
   - Remove items by clicking the X on badges

2. **Set Currency** (optional)
   - Choose currency type (TC/CC/MM)
   - Enter the amount to distribute
   - Must have either items OR currency (or both)

3. **Add Recipients**
   - **Manual Entry**: Type names directly, press space to create new entries
   - **CSV Import**: Upload a CSV file with player data
     - Select how many top performers to import
     - System sorts by Points column automatically
     - Confirms before replacing existing data

4. **Review & Submit**
   - Check for duplicate names (highlighted in red)
   - Review name count and statistics
   - Submit when validation requirements are met

### CSV Format Requirements

Your CSV file should include these columns:
- `Displayname` - Player display names
- `Points` - Performance score for ranking
- `NameColor`, `Wins`, `SeasonPoints`, `Eliminations`, `TotalRaces` (optional)

Example CSV structure:
```csv
Displayname,NameColor,Wins,Points,SeasonPoints,Eliminations,TotalRaces
PlayerOne,Blue,5,1250,2500,3,20
PlayerTwo,Red,8,1100,2200,1,18
```

### Validation Rules

- **Items OR Currency Required**: Must specify at least one distribution method
- **Recipients Required**: At least one name must be entered
- **Currency Validation**: Amount must be positive number if specified
- **Duplicate Detection**: System warns about duplicate names but allows submission

## 🔧 Technical Details

### Built With
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Lucide React**: Modern icon library
- **CSS Modules**: Scoped styling system

### Architecture
- **Client-Side Rendering**: Interactive form components
- **Mock API Integration**: Simulated item loading with retry logic
- **State Management**: React hooks for complex form state
- **File Processing**: Browser-based CSV parsing and validation

### Key Components
- **Form Management**: Multi-section form with cross-validation
- **CSV Parser**: Robust file processing with error handling
- **Autocomplete System**: Efficient search and suggestion logic
- **Validation Engine**: Real-time duplicate detection and form validation

## 🎯 Future Enhancements

- **Backend Integration**: Replace mock API with real endpoints
- **User Authentication**: Add login and permission systems
- **Distribution History**: Track and display past distributions
- **Advanced Filtering**: Enhanced CSV import with custom sorting options
- **Bulk Operations**: Additional mass management features
- **Export Functionality**: Generate distribution reports

## 📊 Performance

- **Optimized Loading**: Async item fetching with loading states
- **Efficient Rendering**: Minimal re-renders with proper React patterns
- **Memory Management**: Clean component lifecycle and state cleanup
- **File Processing**: Streaming CSV parsing for large files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review the codebase comments for technical details

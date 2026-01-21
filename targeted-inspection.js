// ============================================================================
// TARGETED INSPECTION SCRIPT: Find the Real Add Marks Button
// ============================================================================
// Paste this into browser console - this will find the actual attribute used
// ============================================================================

console.log('=== TARGETED ADD MARKS INSPECTION ===');

// 1. Look for common button text patterns
const textPatterns = [
    'Add Marks',
    'add-marks',
    'add_marks',
    'AddMarks',
    'add marks'
];

textPatterns.forEach(pattern => {
    const elements = $(`:contains("${pattern}")`);
    console.log(`🔍 Searching for text: "${pattern}" - Found ${elements.length} elements`);
    
    elements.each(function(index) {
        if (index < 3) { // Show first 3 matches
            const element = $(this);
            console.log(`   ${index + 1}. Tag: ${element.prop('tagName')}`);
            console.log(`      Text: ${element.text().trim()}`);
            console.log(`      Classes: ${element.attr('class')}`);
            console.log(`      All Attributes:`, element[0].attributes);
            console.log('---');
        }
    });
});

// 2. Look for any data-* attributes with "add" or "mark"
console.log('\n🔍 Searching for ANY data-* attributes with "add" or "mark"...');
$('[data*="add"], [data*="mark"], [data*="Add"], [data*="Mark"]').each(function(index) {
    if (index < 10) {
        const element = $(this);
        const attributes = {};
        $.each(element[0].attributes, function(i, attr) {
            if (attr.name.startsWith('data-')) {
                attributes[attr.name] = attr.value;
            }
        });
        
        console.log(`📋 Element ${index + 1}:`);
        console.log(`   Tag: ${element.prop('tagName')}`);
        console.log(`   Text: ${element.text().trim()}`);
        console.log(`   Data Attributes:`, attributes);
        console.log(`   Classes: ${element.attr('class')}`);
        console.log('---');
    }
});

// 3. Look specifically in tool containers
console.log('\n🔍 Searching in tool containers...');
$('.tool-container, .tools, .tool-panel, .btn-group').each(function(index) {
    const container = $(this);
    console.log(`📦 Tool Container ${index + 1}:`);
    console.log(`   HTML: ${container[0].outerHTML.substring(0, 200)}...`);
    
    // Find all buttons/links inside
    container.find('button, a, div[onclick], span[onclick]').each(function(btnIndex) {
        if (btnIndex < 5) {
            const btn = $(this);
            console.log(`   🎯 Button ${btnIndex + 1}: ${btn.prop('tagName')} - "${btn.text().trim()}"`);
            console.log(`      Classes: ${btn.attr('class')}`);
            console.log(`      Data Attributes:`, btn[0].attributes);
        }
    });
    console.log('---');
});

// 4. Check if there's a dynamic attribute assignment
console.log('\n🔍 Checking for dynamic attribute assignment...');
setTimeout(() => {
    // Look for any element that might get the attribute added later
    $('[onclick*="add"], [onclick*="mark"], [onclick*="Add"]').each(function(index) {
        const element = $(this);
        console.log(`🎯 Dynamic Element ${index + 1}:`);
        console.log(`   Tag: ${element.prop('tagName')}`);
        console.log(`   onclick: ${element.attr('onclick')}`);
        console.log(`   Classes: ${element.attr('class')}`);
    });
}, 100);

console.log('\n=== TARGETED INSPECTION COMPLETE ===');
console.log('💡 Look for patterns in the output to identify your Add Marks button!');

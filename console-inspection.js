// ============================================================================
// CONSOLE INSPECTION SCRIPT: Add Marks Tool Debug
// ============================================================================
// Paste this script into your browser's Developer Tools Console tab
// ============================================================================

console.log('=== ADD MARKS TOOL INSPECTION START ===');

// 1. Search Broadly - Find any element with data-name="add-marks"
const addMarksElements = $('[data-name="add-marks"]');
console.log('🔍 Elements with data-name="add-marks":', addMarksElements.length);

if (addMarksElements.length > 0) {
    addMarksElements.each(function(index) {
        const element = $(this);
        
        // 2. Log Details for each found element
        console.log(`📋 Element ${index + 1}:`);
        console.log('   Tag Name:', element.prop('tagName'));
        console.log('   Full Class List:', element.attr('class'));
        console.log('   Outer HTML:', element[0].outerHTML);
        console.log('   Data Attributes:', {
            'data-name': element.attr('data-name'),
            'data-tooltip': element.attr('data-tooltip'),
            'onclick': element.attr('onclick')
        });
        console.log('---');
    });
    
    // 3. Monitor Changes - Active State Tracking
    console.log('👀 Starting Active State Monitoring (checking every 2 seconds)...');
    
    let monitoringInterval = setInterval(function() {
        const currentElement = $('[data-name="add-marks"]');
        const isActive = currentElement.hasClass('active') || 
                       currentElement.hasClass('selected') || 
                       currentElement.hasClass('btn-primary') ||
                       currentElement.hasClass('btn-dark');
        
        console.log('🔄 Active State Check:', {
            'timestamp': new Date().toLocaleTimeString(),
            'is_active': isActive,
            'classes': currentElement.attr('class'),
            'has_active': currentElement.hasClass('active'),
            'has_selected': currentElement.hasClass('selected'),
            'has_btn-primary': currentElement.hasClass('btn-primary'),
            'has_btn-dark': currentElement.hasClass('btn-dark')
        });
    }, 2000);
    
    // 4. Click Handler to Monitor Selection
    $('[data-name="add-marks"]').on('click', function() {
        console.log('🖱️ ADD MARKS BUTTON CLICKED!');
        console.log('   Classes after click:', $(this).attr('class'));
        console.log('   Timestamp:', new Date().toLocaleTimeString());
    });
    
    console.log('✅ Monitoring active. Click the Add Marks button to see state changes.');
    console.log('💡 To stop monitoring, run: clearInterval(monitoringInterval)');
    
} else {
    console.error('❌ ERROR: No elements found with data-name="add-marks"');
    console.log('🔍 Searching for ANY elements with data-name attribute...');
    
    // Show all elements with data-name for debugging
    const allDataNameElements = $('[data-name]');
    console.log('📋 Found', allDataNameElements.length, 'elements with data-name:');
    
    allDataNameElements.each(function(index) {
        if (index < 10) { // Show first 10 elements
            const element = $(this);
            console.log(`   ${index + 1}. ${element.prop('tagName')}[data-name="${element.attr('data-name')}"] - Classes: ${element.attr('class')}`);
        }
    });
    
    console.log('💡 Check if your Add Marks tool has a different data-name value');
}

console.log('=== INSPECTION COMPLETE ===');

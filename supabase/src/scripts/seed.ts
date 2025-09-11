import { supabaseAdmin } from '../config/supabase';

// Function to seed the conversion table with sample data
export const seedConversionTable = async (): Promise<void> => {
  console.log('Starting to seed conversion table...');

  try {
    // Clear existing data
    const { error: deleteError } = await supabaseAdmin
      .from('conversion_table')
      .delete()
      .gt('cm', -1); // Delete all rows

    if (deleteError) {
      console.error('Error clearing conversion table:', deleteError);
      return;
    }

    // Generate conversion data (cm to litres)
    const conversionData = [];
    for (let cm = 1; cm <= 300; cm++) {
      // Simple conversion formula: 1 cm³ = 0.001 litre
      const litres = (cm * cm * cm) * 0.001;
      conversionData.push({
        cm,
        litres: parseFloat(litres.toFixed(3))
      });
    }

    // Insert the new data
    const { error: insertError } = await supabaseAdmin
      .from('conversion_table')
      .insert(conversionData);

    if (insertError) {
      console.error('Error seeding conversion table:', insertError);
      return;
    }

    console.log('Conversion table seeded successfully!');
  } catch (error) {
    console.error('Error during seeding process:', error);
  }
};

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedConversionTable();
}

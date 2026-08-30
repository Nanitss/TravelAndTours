// Direct password fix script - run this in browser console
// Copy and paste this entire script into your browser console

console.log('🔧 Starting direct admin password fix...');

// Import Firebase functions (you'll need to run this in the browser console)
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';

async function fixAdminPasswordDirectly() {
  try {
    console.log('🔍 Looking for admin user...');
    
    // Get the admin user document directly
    const adminDocRef = doc(db, 'Users', 'ZsVPbOApP7MSOJBAGLRM'); // Use the ID from your console logs
    const adminDoc = await getDoc(adminDocRef);
    
    if (!adminDoc.exists()) {
      console.log('❌ Admin document not found');
      return;
    }
    
    console.log('📋 Current admin data:', adminDoc.data());
    
    // Hash the password using the same method as your app
    const hashedPassword = btoa('Admin123' + 'salt');
    console.log('🔐 Original password: Admin123');
    console.log('🔐 Hashed password:', hashedPassword);
    
    // Update the password directly
    console.log('🔄 Updating password in database...');
    await updateDoc(adminDocRef, {
      password: hashedPassword,
      Password: hashedPassword,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Password updated successfully!');
    
    // Verify the update
    const updatedDoc = await getDoc(adminDocRef);
    console.log('🔍 Updated admin data:', updatedDoc.data());
    console.log('🔍 New password field:', updatedDoc.data().password);
    console.log('🔍 New Password field:', updatedDoc.data().Password);
    
    console.log('🎉 Admin password fix completed! You can now login with Admin@gmail.com / Admin123');
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  }
}

// Run the fix
fixAdminPasswordDirectly();

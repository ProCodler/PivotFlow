#!/usr/bin/env node

/**
 * Integration Test Script for PivotFlow
 * Tests backend API integration and frontend connectivity
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Starting PivotFlow Integration Tests\n');

// Test Backend APIs
async function testBackendAPIs() {
  console.log('📡 Testing Backend APIs...\n');
  
  const tests = [
    {
      name: 'Get Network Fees',
      command: 'dfx canister call --candid src/declarations/PivotFlow_backend/PivotFlow_backend.did PivotFlow_backend getNetworkFees'
    },
    {  
      name: 'Create User',
      command: 'dfx canister call --candid src/declarations/PivotFlow_backend/PivotFlow_backend.did PivotFlow_backend createUser \'("integration-test-user")\''
    },
    {
      name: 'Get User',
      command: 'dfx canister call --candid src/declarations/PivotFlow_backend/PivotFlow_backend.did PivotFlow_backend getUser'
    },
    {
      name: 'Create NFT Alert',
      command: 'dfx canister call --candid src/declarations/PivotFlow_backend/PivotFlow_backend.did PivotFlow_backend createNFTAlert \'("test-collection", "Test Collection", variant {drop_below}, 10.0, "ETH")\''
    },
    {
      name: 'Get User NFT Alerts',
      command: 'dfx canister call --candid src/declarations/PivotFlow_backend/PivotFlow_backend.did PivotFlow_backend getUserNFTAlerts'
    },
    {
      name: 'Create Gas Alert',
      command: 'dfx canister call --candid src/declarations/PivotFlow_backend/PivotFlow_backend.did PivotFlow_backend createGasAlert \'("Polygon", 30, variant {standard})\''
    },
    {
      name: 'Get User Gas Alerts',
      command: 'dfx canister call --candid src/declarations/PivotFlow_backend/PivotFlow_backend.did PivotFlow_backend getUserGasAlerts'
    }
  ];

  let passedTests = 0;
  
  for (const test of tests) {
    try {
      console.log(`⏳ Testing: ${test.name}...`);
      const { stdout, stderr } = await execAsync(test.command, { 
        cwd: '/home/ubuntu/Desktop/PivotFlow',
        timeout: 30000 
      });
      
      if (stdout && !stderr) {
        console.log(`✅ ${test.name}: PASSED`);
        console.log(`   Result: ${stdout.trim().substring(0, 100)}${stdout.length > 100 ? '...' : ''}\n`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`   Error: ${stderr}\n`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
  
  console.log(`📊 Backend API Tests: ${passedTests}/${tests.length} passed\n`);
  return passedTests === tests.length;
}

// Test Frontend Build
async function testFrontendBuild() {
  console.log('🏗️  Testing Frontend Build...\n');
  
  try {
    console.log('⏳ Building PivotFlow_frontend...');
    const { stdout, stderr } = await execAsync('npm run build', { 
      cwd: '/home/ubuntu/Desktop/PivotFlow/src/PivotFlow_frontend',
      timeout: 120000 
    });
    
    if (!stderr.includes('error') && stdout.includes('built in')) {
      console.log('✅ Frontend Build: PASSED');
      console.log('   Frontend builds successfully without TypeScript errors\n');
      return true;
    } else {
      console.log('❌ Frontend Build: FAILED');
      console.log(`   Errors: ${stderr}\n`);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend Build: FAILED');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

// Test Canister Health
async function testCanisterHealth() {
  console.log('🏥 Testing Canister Health...\n');
  
  try {
    console.log('⏳ Checking dfx ping...');
    const { stdout } = await execAsync('dfx ping', { 
      cwd: '/home/ubuntu/Desktop/PivotFlow',
      timeout: 10000 
    });
    
    if (stdout.includes('replica_health_status')) {
      console.log('✅ Replica Health: PASSED');
      console.log('   IC replica is healthy and responding\n');
      
      console.log('⏳ Checking canister status...');
      const { stdout: statusOutput } = await execAsync('dfx canister status --all', { 
        cwd: '/home/ubuntu/Desktop/PivotFlow',
        timeout: 10000 
      });
      
      if (statusOutput.includes('Status: Running')) {
        console.log('✅ Canister Status: PASSED');
        console.log('   All canisters are running properly\n');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.log('❌ Canister Health: FAILED');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🔬 PivotFlow Integration Test Suite');
  console.log('=====================================\n');
  
  const healthPassed = await testCanisterHealth();
  const backendPassed = await testBackendAPIs();
  const frontendPassed = await testFrontendBuild();
  
  console.log('📋 Test Summary');
  console.log('===============');
  console.log(`🏥 Canister Health: ${healthPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`📡 Backend APIs: ${backendPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`🏗️  Frontend Build: ${frontendPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = healthPassed && backendPassed && frontendPassed;
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 PivotFlow is fully functional!');
    console.log('   • Backend APIs are working correctly');
    console.log('   • Frontend builds without errors');
    console.log('   • Canisters are healthy and running');
    console.log('\n🌐 Access Points:');
    console.log('   • Frontend (deployed): http://ufxgi-4p777-77774-qaadq-cai.localhost:4943/');
    console.log('   • Frontend (dev): http://localhost:3000/');
    console.log('   • Backend Candid UI: http://127.0.0.1:4943/?canisterId=vizcg-th777-77774-qaaea-cai&id=ucwa4-rx777-77774-qaada-cai');
  } else {
    console.log('\n⚠️  Some issues found. Please check the logs above for details.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runAllTests().catch(console.error);

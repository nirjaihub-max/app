#!/usr/bin/env python3

import requests
import sys
import json
import uuid
from datetime import datetime
import base64
import time

class HanumanGPTTester:
    def __init__(self):
        self.base_url = "https://divine-content-ai.preview.emergentagent.com/api"
        self.session_id = f"test-session-{uuid.uuid4()}"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}: PASSED {details}")
        else:
            print(f"❌ {test_name}: FAILED {details}")
        
        self.test_results.append({
            "test": test_name,
            "status": "PASSED" if success else "FAILED",
            "details": details
        })

    def test_api_health(self):
        """Test API health check"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            self.log_test("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("API Health Check", False, f"Exception: {str(e)}")
            return False

    def test_chat_endpoint(self):
        """Test chat endpoint with GPT-5.2"""
        try:
            payload = {
                "message": "Hello, who are you?",
                "session_id": self.session_id,
                "language": "en"
            }
            
            print("🔄 Testing chat endpoint (GPT-5.2)...")
            response = requests.post(
                f"{self.base_url}/chat", 
                json=payload, 
                timeout=30
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if 'response' in data and 'session_id' in data:
                    details += f", Response length: {len(data['response'])} chars"
                    # Wait a moment for AI response processing
                    time.sleep(2)
                else:
                    success = False
                    details += ", Missing required fields in response"
            else:
                details += f", Error: {response.text[:100]}"
                
            self.log_test("Chat Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Chat Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_image_generation(self):
        """Test image generation endpoint"""
        try:
            payload = {
                "prompt": "A beautiful sunset over mountains",
                "language": "en"
            }
            
            print("🔄 Testing image generation (this may take 10-15 seconds)...")
            response = requests.post(
                f"{self.base_url}/image/generate",
                json=payload,
                timeout=60
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if 'image_base64' in data and 'prompt' in data:
                    image_size = len(data['image_base64'])
                    details += f", Image size: {image_size} chars (base64)"
                    # Wait for image processing
                    time.sleep(3)
                else:
                    success = False
                    details += ", Missing required fields in response"
            else:
                details += f", Error: {response.text[:100]}"
                
            self.log_test("Image Generation", success, details)
            return success
        except Exception as e:
            self.log_test("Image Generation", False, f"Exception: {str(e)}")
            return False

    def test_chat_history(self):
        """Test chat history retrieval"""
        try:
            response = requests.get(
                f"{self.base_url}/chat/history/{self.session_id}",
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if 'messages' in data:
                    message_count = len(data['messages'])
                    details += f", Messages: {message_count}"
                else:
                    success = False
                    details += ", Missing 'messages' field"
            else:
                details += f", Error: {response.text[:100]}"
                
            self.log_test("Chat History", success, details)
            return success
        except Exception as e:
            self.log_test("Chat History", False, f"Exception: {str(e)}")
            return False

    def test_hindi_chat(self):
        """Test chat with Hindi language"""
        try:
            payload = {
                "message": "हैलो, आप कौन हैं?",
                "session_id": f"hindi-{self.session_id}",
                "language": "hi"
            }
            
            print("🔄 Testing Hindi chat...")
            response = requests.post(
                f"{self.base_url}/chat",
                json=payload,
                timeout=30
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                if 'response' in data:
                    details += f", Response length: {len(data['response'])} chars"
                    time.sleep(2)
                else:
                    success = False
                    details += ", Missing response field"
            else:
                details += f", Error: {response.text[:100]}"
                
            self.log_test("Hindi Chat", success, details)
            return success
        except Exception as e:
            self.log_test("Hindi Chat", False, f"Exception: {str(e)}")
            return False

    def test_invalid_endpoints(self):
        """Test error handling for invalid requests"""
        try:
            # Test invalid chat request
            response = requests.post(
                f"{self.base_url}/chat",
                json={"invalid": "data"},
                timeout=10
            )
            
            success = response.status_code in [400, 422]  # Should return validation error
            details = f"Invalid chat request status: {response.status_code}"
            
            self.log_test("Error Handling", success, details)
            return success
        except Exception as e:
            self.log_test("Error Handling", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Hanuman GPT Backend API Tests")
        print(f"🔗 Testing against: {self.base_url}")
        print(f"🆔 Session ID: {self.session_id}")
        print("=" * 60)

        # Core API tests
        if not self.test_api_health():
            print("❌ API health check failed - stopping tests")
            return self.get_summary()

        # Test main functionality
        self.test_chat_endpoint()
        self.test_hindi_chat()
        self.test_image_generation()
        self.test_chat_history()
        self.test_invalid_endpoints()

        return self.get_summary()

    def get_summary(self):
        """Get test summary"""
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - check logs above")
            return False

def main():
    """Main test runner"""
    tester = HanumanGPTTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
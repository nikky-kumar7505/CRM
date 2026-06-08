{
    "info": {
      "name": "Sales CRM Backend",
      "description": "Complete Sales CRM API Collection",
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
      {
        "key": "baseUrl",
        "value": "http://localhost:5001",
        "type": "string"
      },
      {
        "key": "token",
        "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjEyMGQ3YzY2MzBjZmVjMWNkZDc0ZCIsImlhdCI6MTc4MDU1NjE5MCwiZXhwIjoxNzgxMTYwOTkwfQ.of3G7PxGNWWBcW4My7O-1ARW7jvMb4sRdfEeLn9SxGg",
        "type": "string"
      },
      {
        "key": "userId",
        "value": "paste_user_id_here",
        "type": "string"
      },
      {
        "key": "leadId",
        "value": "paste_lead_id_here",
        "type": "string"
      },
      {
        "key": "dealId",
        "value": "paste_deal_id_here",
        "type": "string"
      },
      {
        "key": "meetingId",
        "value": "paste_meeting_id_here",
        "type": "string"
      }
    ],
    "item": [
      {
        "name": "1 - AUTH",
        "item": [
          {
            "name": "Login Admin",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "var jsonData = pm.response.json();",
                    "if(jsonData.token){",
                    "    pm.collectionVariables.set('token', jsonData.token);",
                    "    console.log('Token saved automatically!');",
                    "}"
                  ],
                  "type": "text/javascript"
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"email\": \"knikki7505@gmail.com\",\n  \"password\": \"nikky@123\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/login",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "login"]
              },
              "description": "Login as Admin - Token will be saved automatically"
            }
          },
          {
            "name": "Get My Profile",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/auth/me",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "me"]
              },
              "description": "Get logged in user profile"
            }
          },
          {
            "name": "Change Password",
            "request": {
              "method": "PUT",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"old_password\": \"nikky@123\",\n  \"new_password\": \"nikky@456\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/change-password",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "change-password"]
              }
            }
          }
        ]
      },
      {
        "name": "2 - USER MANAGEMENT",
        "item": [
          {
            "name": "Create Sales Manager",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"name\": \"Amit Sales Manager\",\n  \"email\": \"amit.manager@crm.com\",\n  \"password\": \"manager@123\",\n  \"role\": \"sales_manager\",\n  \"phone\": \"9876543210\",\n  \"department\": \"Sales\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/register",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "register"]
              },
              "description": "Admin creates Sales Manager"
            }
          },
          {
            "name": "Create Lead Qualifier",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"name\": \"Priya Lead Qualifier\",\n  \"email\": \"priya.qualifier@crm.com\",\n  \"password\": \"qualifier@123\",\n  \"role\": \"lead_qualifier\",\n  \"phone\": \"9876543211\",\n  \"department\": \"Sales\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/register",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "register"]
              },
              "description": "Admin creates Lead Qualifier"
            }
          },
          {
            "name": "Create Sales Closer",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"name\": \"Rohit Sales Closer\",\n  \"email\": \"rohit.closer@crm.com\",\n  \"password\": \"closer@123\",\n  \"role\": \"sales_closer\",\n  \"phone\": \"9876543212\",\n  \"department\": \"Sales\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/register",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "register"]
              },
              "description": "Admin creates Sales Closer"
            }
          },
          {
            "name": "Get All Users",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/auth/users",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "users"]
              },
              "description": "Get all users - Admin only"
            }
          },
          {
            "name": "Get Users by Role - sales_manager",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/auth/users?role=sales_manager",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "users"],
                "query": [
                  {
                    "key": "role",
                    "value": "sales_manager"
                  }
                ]
              }
            }
          },
          {
            "name": "Get Users by Role - lead_qualifier",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/auth/users?role=lead_qualifier",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "users"],
                "query": [
                  {
                    "key": "role",
                    "value": "lead_qualifier"
                  }
                ]
              }
            }
          },
          {
            "name": "Get Users by Role - sales_closer",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/auth/users?role=sales_closer",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "users"],
                "query": [
                  {
                    "key": "role",
                    "value": "sales_closer"
                  }
                ]
              }
            }
          },
          {
            "name": "Update User",
            "request": {
              "method": "PUT",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"name\": \"Amit Manager Updated\",\n  \"phone\": \"9999999999\",\n  \"department\": \"Sales and Marketing\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/users/{{userId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "users", "{{userId}}"]
              },
              "description": "Update userId variable first"
            }
          },
          {
            "name": "Delete User",
            "request": {
              "method": "DELETE",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/auth/users/{{userId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "users", "{{userId}}"]
              },
              "description": "Update userId variable first"
            }
          },
          {
            "name": "Login as Sales Manager",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "var jsonData = pm.response.json();",
                    "if(jsonData.token){",
                    "    pm.collectionVariables.set('token', jsonData.token);",
                    "    console.log('Manager Token saved!');",
                    "}"
                  ],
                  "type": "text/javascript"
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"email\": \"amit.manager@crm.com\",\n  \"password\": \"manager@123\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/login",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "login"]
              }
            }
          },
          {
            "name": "Login as Lead Qualifier",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "var jsonData = pm.response.json();",
                    "if(jsonData.token){",
                    "    pm.collectionVariables.set('token', jsonData.token);",
                    "    console.log('Qualifier Token saved!');",
                    "}"
                  ],
                  "type": "text/javascript"
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"email\": \"priya.qualifier@crm.com\",\n  \"password\": \"qualifier@123\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/login",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "login"]
              }
            }
          },
          {
            "name": "Login as Sales Closer",
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "var jsonData = pm.response.json();",
                    "if(jsonData.token){",
                    "    pm.collectionVariables.set('token', jsonData.token);",
                    "    console.log('Closer Token saved!');",
                    "}"
                  ],
                  "type": "text/javascript"
                }
              }
            ],
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"email\": \"rohit.closer@crm.com\",\n  \"password\": \"closer@123\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/auth/login",
                "host": ["{{baseUrl}}"],
                "path": ["api", "auth", "login"]
              }
            }
          }
        ]
      },
      {
        "name": "3 - LEADS",
        "item": [
          {
            "name": "Create Lead 1 - Creator",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"lead_name\": \"Rahul Sharma\",\n  \"contact_number\": \"9876543210\",\n  \"alternate_contact\": \"9876543211\",\n  \"email\": \"rahul@gmail.com\",\n  \"business_type\": \"creator\",\n  \"business_name\": \"Rahul Creates\",\n  \"website\": \"www.rahulcreates.com\",\n  \"social_media_handle\": \"@rahulcreates\",\n  \"lead_source\": \"instagram\",\n  \"lead_source_detail\": \"Reel campaign December\",\n  \"budget\": \"50000\",\n  \"requirements\": \"Wants social media management\",\n  \"priority\": \"high\",\n  \"tags\": [\"instagram\", \"creator\"],\n  \"city\": \"Mumbai\",\n  \"state\": \"Maharashtra\",\n  \"country\": \"India\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads"]
              }
            }
          },
          {
            "name": "Create Lead 2 - Coach",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"lead_name\": \"Sneha Coach\",\n  \"contact_number\": \"8765432109\",\n  \"email\": \"sneha@gmail.com\",\n  \"business_type\": \"coach\",\n  \"business_name\": \"Sneha Life Coach\",\n  \"lead_source\": \"facebook\",\n  \"budget\": \"30000\",\n  \"requirements\": \"Wants lead generation funnel\",\n  \"priority\": \"medium\",\n  \"city\": \"Delhi\",\n  \"state\": \"Delhi\",\n  \"country\": \"India\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads"]
              }
            }
          },
          {
            "name": "Create Lead 3 - Brand",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"lead_name\": \"Vikram Brand\",\n  \"contact_number\": \"7654321098\",\n  \"email\": \"vikram@gmail.com\",\n  \"business_type\": \"brand\",\n  \"business_name\": \"Vikram Enterprises\",\n  \"lead_source\": \"referral\",\n  \"budget\": \"100000\",\n  \"requirements\": \"Complete digital marketing package\",\n  \"priority\": \"urgent\",\n  \"city\": \"Bangalore\",\n  \"state\": \"Karnataka\",\n  \"country\": \"India\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads"]
              }
            }
          },
          {
            "name": "Get All Leads",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads"]
              }
            }
          },
          {
            "name": "Get Leads - Filter by Stage",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads?current_stage=new",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads"],
                "query": [
                  {
                    "key": "current_stage",
                    "value": "new"
                  }
                ]
              }
            }
          },
          {
            "name": "Get Leads - Filter by Priority",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads?priority=high",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads"],
                "query": [
                  {
                    "key": "priority",
                    "value": "high"
                  }
                ]
              }
            }
          },
          {
            "name": "Get Leads - Search",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads?search=Rahul",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads"],
                "query": [
                  {
                    "key": "search",
                    "value": "Rahul"
                  }
                ]
              }
            }
          },
          {
            "name": "Get Leads - Pagination",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads?page=1&limit=5",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads"],
                "query": [
                  {
                    "key": "page",
                    "value": "1"
                  },
                  {
                    "key": "limit",
                    "value": "5"
                  }
                ]
              }
            }
          },
          {
            "name": "Get Single Lead",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads/{{leadId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads", "{{leadId}}"]
              },
              "description": "Update leadId variable first"
            }
          },
          {
            "name": "Get Lead Stats",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads/stats",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads", "stats"]
              }
            }
          },
          {
            "name": "Update Lead",
            "request": {
              "method": "PUT",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"current_stage\": \"interested\",\n  \"priority\": \"urgent\",\n  \"budget\": \"75000\",\n  \"requirements\": \"Updated - wants full package\",\n  \"next_follow_up_date\": \"2024-12-30\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads/{{leadId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads", "{{leadId}}"]
              },
              "description": "Update leadId variable first"
            }
          },
          {
            "name": "Assign Lead to Qualifier",
            "request": {
              "method": "PUT",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"qualifier_id\": \"PASTE_LEAD_QUALIFIER_USER_ID_HERE\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads/{{leadId}}/assign",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads", "{{leadId}}", "assign"]
              },
              "description": "Update leadId variable and paste qualifier_id in body"
            }
          },
          {
            "name": "Add Call Log",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"calling_status\": \"interested\",\n  \"comment\": \"Client is very interested. Wants to know more about pricing. Will call again tomorrow.\",\n  \"call_duration\": \"8 mins 30 sec\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads/{{leadId}}/call-log",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads", "{{leadId}}", "call-log"]
              }
            }
          },
          {
            "name": "Add Call Log 2",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"calling_status\": \"contacted\",\n  \"comment\": \"Discussed pricing. Client wants meeting with senior closer.\",\n  \"call_duration\": \"15 mins\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads/{{leadId}}/call-log",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads", "{{leadId}}", "call-log"]
              }
            }
          },
          {
            "name": "Pass Lead to Sales Closer",
            "request": {
              "method": "PUT",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads/{{leadId}}/pass-to-closer",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads", "{{leadId}}", "pass-to-closer"]
              }
            }
          },
          {
            "name": "Delete Lead - Admin Only",
            "request": {
              "method": "DELETE",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/leads/{{leadId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "leads", "{{leadId}}"]
              }
            }
          }
        ]
      },
      {
        "name": "4 - DEALS",
        "item": [
          {
            "name": "Create Deal from Lead",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"lead_id\": \"PASTE_LEAD_MONGO_ID_HERE\",\n  \"sales_closer_id\": \"PASTE_SALES_CLOSER_USER_ID_HERE\",\n  \"deal_value\": 75000,\n  \"expected_closure_date\": \"2024-12-31\",\n  \"notes\": \"Client is very interested. Has budget approved. Needs final meeting.\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals"]
              },
              "description": "Paste lead mongo _id and sales closer user _id in body"
            }
          },
          {
            "name": "Get All Deals",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals"]
              }
            }
          },
          {
            "name": "Get Deals - Filter by Stage",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals?deal_stage=meeting_scheduled",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals"],
                "query": [
                  {
                    "key": "deal_stage",
                    "value": "meeting_scheduled"
                  }
                ]
              }
            }
          },
          {
            "name": "Get Single Deal",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals/{{dealId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals", "{{dealId}}"]
              },
              "description": "Update dealId variable first"
            }
          },
          {
            "name": "Get Deal Stats",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals/stats",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals", "stats"]
              }
            }
          },
          {
            "name": "Update Deal",
            "request": {
              "method": "PUT",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"deal_stage\": \"negotiation\",\n  \"deal_value\": 80000,\n  \"notes\": \"Client negotiating on price. Offered 80k package.\",\n  \"closer_comment\": \"Positive meeting. Should close this week.\",\n  \"qualifier_visible_notes\": \"Lead contacted by closer. Meeting went well. Expecting closure soon.\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals/{{dealId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals", "{{dealId}}"]
              }
            }
          },
          {
            "name": "Add Meeting to Deal",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"meeting_title\": \"Discovery Call with Rahul\",\n  \"meeting_date\": \"2024-12-28\",\n  \"meeting_time\": \"11:00 AM\",\n  \"meeting_type\": \"video_call\",\n  \"meeting_link\": \"https://meet.google.com/abc-defg-hij\",\n  \"meeting_notes\": \"Discuss full package pricing and requirements\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals/{{dealId}}/meetings",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals", "{{dealId}}", "meetings"]
              }
            }
          },
          {
            "name": "Update Meeting Outcome",
            "request": {
              "method": "PUT",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"meeting_outcome\": \"positive\",\n  \"meeting_notes\": \"Client agreed on 80k package. Sending proposal now.\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals/{{dealId}}/meetings/{{meetingId}}",
                "host": ["{{baseUrl}}"],
                "path": [
                  "api",
                  "sales",
                  "deals",
                  "{{dealId}}",
                  "meetings",
                  "{{meetingId}}"
                ]
              },
              "description": "Update dealId and meetingId variables first"
            }
          },
          {
            "name": "Close Deal - WON",
            "request": {
              "method": "PUT",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"deal_stage\": \"closed_won\",\n  \"payment_status\": \"fully_paid\",\n  \"payment_amount\": 80000,\n  \"payment_date\": \"2024-12-28\",\n  \"actual_closure_date\": \"2024-12-28\",\n  \"closure_reason\": \"Client happy with pricing. Payment received.\",\n  \"qualifier_visible_notes\": \"DEAL CLOSED! Payment received. Great work team!\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals/{{dealId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals", "{{dealId}}"]
              }
            }
          },
          {
            "name": "Close Deal - LOST",
            "request": {
              "method": "PUT",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"deal_stage\": \"closed_lost\",\n  \"closure_reason\": \"Client went with competitor. Budget was too low.\",\n  \"qualifier_visible_notes\": \"Deal lost. Client chose another agency.\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals/{{dealId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals", "{{dealId}}"]
              }
            }
          },
          {
            "name": "Delete Deal - Admin Only",
            "request": {
              "method": "DELETE",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/sales/deals/{{dealId}}",
                "host": ["{{baseUrl}}"],
                "path": ["api", "sales", "deals", "{{dealId}}"]
              }
            }
          }
        ]
      },
      {
        "name": "5 - ATTENDANCE",
        "item": [
          {
            "name": "Get Attendance",
            "request": {
              "method": "GET",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                }
              ],
              "url": {
                "raw": "{{baseUrl}}/api/attendance",
                "host": ["{{baseUrl}}"],
                "path": ["api", "attendance"]
              }
            }
          },
          {
            "name": "Mark Attendance",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Authorization",
                  "value": "Bearer {{token}}"
                },
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"date\": \"2024-12-28\",\n  \"status\": \"present\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/api/attendance/mark",
                "host": ["{{baseUrl}}"],
                "path": ["api", "attendance", "mark"]
              }
            }
          }
        ]
      }
    ]
  }
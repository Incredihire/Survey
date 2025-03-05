import boto3
import time
import sys

def diagnose_deployment():
    # Initialize CloudFormation client
    cloudformation = boto3.client('cloudformation')
    ecs = boto3.client('ecs')
    
    # Get stack events
    try:
        stack_name = "SurveyStack"
        print(f"Checking status of stack: {stack_name}")
        
        # Get stack details
        stack_response = cloudformation.describe_stacks(StackName=stack_name)
        stack = stack_response['Stacks'][0]
        print(f"Stack status: {stack['StackStatus']}")
        
        # If stack is in progress, check resources
        if 'IN_PROGRESS' in stack['StackStatus']:
            print("\nChecking ECS services status...")
            
            # List ECS clusters
            clusters = ecs.list_clusters()['clusterArns']
            
            for cluster_arn in clusters:
                cluster_name = cluster_arn.split('/')[-1]
                if 'Survey' in cluster_name:
                    print(f"\nFound relevant cluster: {cluster_name}")
                    
                    # List services in the cluster
                    services = ecs.list_services(cluster=cluster_arn)['serviceArns']
                    
                    for service_arn in services:
                        service_name = service_arn.split('/')[-1]
                        print(f"\nChecking service: {service_name}")
                        
                        # Get service details
                        service_details = ecs.describe_services(
                            cluster=cluster_arn,
                            services=[service_arn]
                        )['services'][0]
                        
                        print(f"Service status: {service_details['status']}")
                        print(f"Desired count: {service_details['desiredCount']}")
                        print(f"Running count: {service_details['runningCount']}")
                        
                        # Check deployments
                        if 'deployments' in service_details:
                            for deployment in service_details['deployments']:
                                print(f"Deployment status: {deployment['status']}")
                                print(f"Pending count: {deployment['pendingCount']}")
                                print(f"Running count: {deployment['runningCount']}")
                                print(f"Failed tasks: {deployment.get('failedTasks', 0)}")
                        
                        # Check events for issues
                        print("\nRecent events:")
                        for event in service_details.get('events', [])[:5]:
                            print(f"- {event['message']}")
        
        # Get recent stack events
        print("\nRecent CloudFormation events:")
        events = cloudformation.describe_stack_events(StackName=stack_name)['StackEvents']
        for event in events[:10]:  # Show last 10 events
            print(f"{event['Timestamp']} | {event['ResourceStatus']} | {event['ResourceType']} | {event['LogicalResourceId']}")
            if 'ResourceStatusReason' in event:
                print(f"  Reason: {event['ResourceStatusReason']}")
                
    except Exception as e:
        print(f"Error diagnosing deployment: {str(e)}")

if __name__ == "__main__":
    diagnose_deployment()
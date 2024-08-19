from rest_framework import generics, status, views
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer
from .services import generate_text, find_activities, find_similar_activities


class TaskListCreate(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class GenerateTextView(views.APIView):
    def post(self, request, *args, **kwargs):
        prompt = request.data.get('prompt')
        if not prompt:
            return Response({"error": "Prompt is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        generated_text = generate_text(prompt)
        return Response({"data": generated_text}, status=status.HTTP_200_OK)

# View which echoes back the input.
# This api does not interact with the database but merely returns a
# response based on the input
class EchoView(views.APIView):
    def post(self, request, *args, **kwargs):
        prompt = request.data.get('prompt')
        if not prompt:
            return Response({"error": "Prompt is required"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"echo":prompt}, status=status.HTTP_200_OK)
    
# View which retrieves a task that has the completed field = false.
# Uses the Django database library to interact with the database.
# See https://docs.djangoproject.com/en/5.0/topics/db/queries/
#   for more examples on making database calls
class NextTaskView(views.APIView):
    def get(self, request, *args, **kwargs):
        incompleteTasks = Task.objects.filter(completed = False)
        if len(incompleteTasks) == 0:
            return Response(status=status.HTTP_204_NO_CONTENT)
        aTask = incompleteTasks[0]
        # once we have a model object, use the appropriate serializer
        # to serialize the response
        serializer = TaskSerializer(aTask)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class FindActivitiesView(views.APIView):
    queryset = Task.objects.all()

    def post(self, request, *args, **kwargs):

        location = request.data.get('location')
        if not location:
            return Response({"error": "location is required"}, status=status.HTTP_400_BAD_REQUEST)

        duration = request.data.get('duration')
        if not location:
            return Response({"error": "duration is required"}, status=status.HTTP_400_BAD_REQUEST)

        interests = request.data.get('interests')

        limit = request.data.get('limit')
        if not limit:
            limit = 5  #default to 5

        aiGeneratedTasks = find_activities(location, duration, interests, limit)
        print("found activities = " + str(aiGeneratedTasks))

        if not aiGeneratedTasks:
            return Response({"error": "Failed to generate sub tasks"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        if len(aiGeneratedTasks)  == 0:
            print("no sub tasks generated")
            return Response({[]}, status=status.HTTP_204_NO_CONTENT)
        
        qs = Task.objects.none

        for activity in aiGeneratedTasks:
            print("activity =" + str(activity))
            genTask = Task(title = activity.get('title'), description = activity.get('description'),
                            duration = activity.get('duration'), cost = activity.get('cost'),
                            location = location)
            genTask.save()
            if qs == Task.objects.none:
                # note use filter instead of get so a QuerySet is returned
                qs = Task.objects.filter(pk=genTask.pk)
            else:
                # note use filter instead of get so a QuerySet is returned
                qs = qs.union(Task.objects.filter(pk=genTask.pk))

        # serialze response
        serializer = TaskSerializer(qs, many=True) 
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class FindSimilarActivitiesView(views.APIView):
    queryset = Task.objects.all()

    def post(self, request, *args, **kwargs):
        taskId = request.data.get('task-id')
        if not taskId:
            return Response({"error": "Prompt is task-id"}, status=status.HTTP_400_BAD_REQUEST)

        srcActivity = Task.objects.get(pk=taskId)
        if not srcActivity:
            return Response({"error": "No activity for task-id"}, status=status.HTTP_400_BAD_REQUEST)

        limit = request.data.get('limit')
        if not limit:
            limit = 3  #default to 3

        otherActivities = Task.objects.filter(location = srcActivity.location)
        otherActivitiesTitles = [act.title for act in otherActivities]

        aiGeneratedTasks = find_similar_activities(srcActivity.location, srcActivity.title, otherActivitiesTitles, limit)
        print("found activities = " + str(aiGeneratedTasks))

        if not aiGeneratedTasks:
            return Response({"error": "Failed to generate sub tasks"}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        if len(aiGeneratedTasks)  == 0:
            print("no sub tasks generated")
            return Response({[]}, status=status.HTTP_204_NO_CONTENT)
        
        qs = Task.objects.none

        for activity in aiGeneratedTasks:
            print("activity =" + str(activity))
            genTask = Task(title = activity.get('title'), description = activity.get('description'),
                            duration = activity.get('duration'), cost = activity.get('cost'),
                            location = srcActivity.location)
            genTask.save()
            if qs == Task.objects.none:
                # note use filter instead of get so a QuerySet is returned
                qs = Task.objects.filter(pk=genTask.pk)
            else:
                # note use filter instead of get so a QuerySet is returned
                qs = qs.union(Task.objects.filter(pk=genTask.pk))

        # serialze response
        serializer = TaskSerializer(qs, many=True) 
        return Response(serializer.data, status=status.HTTP_200_OK)
    
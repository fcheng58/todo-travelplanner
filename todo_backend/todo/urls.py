from django.urls import path
from .views import GenerateTextView, TaskListCreate, TaskDetail, EchoView,NextTaskView, FindActivitiesView, FindSimilarActivitiesView

urlpatterns = [
    path('generate-text/', GenerateTextView.as_view(), name='generate-text'),
    path('tasks/', TaskListCreate.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskDetail.as_view(), name='task-detail'),
    path('echo/', EchoView.as_view(), name='echo'),
    path('next-task/', NextTaskView.as_view(), name='next-task'),
    path('find-activities/', FindActivitiesView.as_view(), name='find-activities'),
    path('find-similar-activities/', FindSimilarActivitiesView.as_view(), name='find-similar-activities'),
]

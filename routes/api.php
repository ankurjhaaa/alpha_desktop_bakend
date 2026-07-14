<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\CourseController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\McqPaperController;
use App\Http\Controllers\McqQuestionController;
use App\Http\Controllers\MaterialController;

Route::post('/login', [AuthController::class, 'login']);
Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);
Route::post('/settings', [\App\Http\Controllers\SettingController::class, 'update']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('courses', CourseController::class);
    Route::get('/topics', [\App\Http\Controllers\TopicController::class, 'index']);
    Route::apiResource('batches', BatchController::class);
    Route::apiResource('students', StudentController::class);
    Route::post('students/{student}/batches', [StudentController::class, 'attachBatch']);
    Route::delete('students/{student}/batches/{batch}', [StudentController::class, 'detachBatch']);
    Route::apiResource('mcq_papers', McqPaperController::class);
    Route::post('mcq_papers/{id}/import-questions', [McqPaperController::class, 'importQuestionsFromBank']);
    Route::get('mcq_papers/{id}/results', [McqPaperController::class, 'results']);
    Route::get('mcq_papers/{id}/results/{user_id}', [McqPaperController::class, 'studentAnswers']);
    Route::delete('mcq_papers/{id}/results/{user_id}', [McqPaperController::class, 'revokeResult']);
    Route::post('mcq_questions/bulk', [McqQuestionController::class, 'bulkStore']);
    Route::apiResource('mcq_questions', McqQuestionController::class);
    Route::apiResource('materials', MaterialController::class);
    
    // Question Bank
    Route::get('/question-bank', [\App\Http\Controllers\QuestionBankController::class, 'index']);
    Route::post('/question-bank', [\App\Http\Controllers\QuestionBankController::class, 'store']);
    Route::post('/question-bank/import', [\App\Http\Controllers\QuestionBankController::class, 'importJson']);
    Route::put('/question-bank/{id}', [\App\Http\Controllers\QuestionBankController::class, 'update']);
    Route::delete('/question-bank/{id}', [\App\Http\Controllers\QuestionBankController::class, 'destroy']);

    // Student Exam Routes
    Route::get('/student/exams', [App\Http\Controllers\StudentExamController::class, 'index']);
    Route::post('/student/exams/{id}/verify', [App\Http\Controllers\StudentExamController::class, 'verifyPassword']);
    Route::post('/student/exams/{id}/submit', [App\Http\Controllers\StudentExamController::class, 'submit']);
    Route::get('/student/exams/{id}/leaderboard', [App\Http\Controllers\StudentExamController::class, 'leaderboard']);
    Route::get('/student/exams/{id}/answers', [App\Http\Controllers\StudentExamController::class, 'viewAnswers']);

    // Student Profile
    Route::get('/student/profile', function (Request $request) {
        $user = $request->user();
        $user->load(['batches.course', 'examResults.mcqPaper']);
        return response()->json($user);
    });

    // Global Leaderboard
    Route::get('/leaderboard', [App\Http\Controllers\StudentExamController::class, 'globalLeaderboard']);

    // Feedbacks
    Route::get('/student/feedbacks', [App\Http\Controllers\FeedbackController::class, 'studentIndex']);
    Route::post('/student/feedbacks', [App\Http\Controllers\FeedbackController::class, 'store']);
    Route::get('/feedbacks', [App\Http\Controllers\FeedbackController::class, 'adminIndex']);
});

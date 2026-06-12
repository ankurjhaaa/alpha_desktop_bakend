<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\CourseController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\McqPaperController;
use App\Http\Controllers\McqQuestionController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('courses', CourseController::class);
    Route::apiResource('batches', BatchController::class);
    Route::apiResource('students', StudentController::class);
    Route::apiResource('mcq_papers', McqPaperController::class);
    Route::apiResource('mcq_questions', McqQuestionController::class);
});

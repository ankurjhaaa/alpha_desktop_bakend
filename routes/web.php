<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/LoginPage');
});

Route::get('/teacher', function () {
    return Inertia::render('Teacher/Dashboard');
});

Route::get('/teacher/courses', function () {
    return Inertia::render('Teacher/CourseManager');
});

Route::get('/teacher/batches', function () {
    return Inertia::render('Teacher/BatchManager');
});

Route::get('/teacher/students', function () {
    return Inertia::render('Teacher/StudentsPage');
});

Route::get('/teacher/mcq-papers', function () {
    return Inertia::render('Teacher/McqManagerPage');
});

Route::get('/teacher/mcq-questions/{id}', function ($id) {
    return Inertia::render('Teacher/McqQuestionManager', ['paperId' => $id]);
});

Route::get('/teacher/materials', function () {
    return Inertia::render('Teacher/MaterialManagerPage');
});

Route::get('/teacher/question-bank', function () {
    return Inertia::render('Teacher/QuestionBankPage');
});

Route::get('/teacher/leaderboard', function () {
    return Inertia::render('Teacher/Leaderboard');
});

Route::get('/teacher/feedbacks', function () {
    return Inertia::render('Teacher/Feedbacks');
});

Route::get('/teacher/about', function () {
    return Inertia::render('Teacher/AboutUs');
});

Route::get('/teacher/settings', function () {
    return Inertia::render('Teacher/SettingsPage');
});

Route::get('/teacher/students/{id}', function ($id) {
    return Inertia::render('Teacher/StudentViewPage', ['studentId' => $id]);
});

Route::get('/teacher/exams/{id}/results', function ($id) {
    return Inertia::render('Teacher/McqPaperResultsPage', ['examId' => $id]);
});

Route::get('/teacher/exams/{examId}/student/{studentId}', function ($examId, $studentId) {
    return Inertia::render('Teacher/StudentExamAnswersPage', ['examId' => $examId, 'studentId' => $studentId]);
});

Route::get('/student', function () {
    return Inertia::render('Student/Dashboard');
});

Route::get('/student/exams', function () {
    return Inertia::render('Student/ExamsPage');
});

Route::get('/student/exams/{id}/take', function ($id) {
    return Inertia::render('Student/ExamTakingPage', ['paperId' => $id]);
});

Route::get('/student/exams/{id}/result', function ($id) {
    return Inertia::render('Student/ExamResultPage', ['paperId' => $id]);
});

Route::get('/student/exams/{id}/answers', function ($id) {
    return Inertia::render('Student/ExamAnswersPage', ['paperId' => $id]);
});

Route::get('/student/materials', function () {
    return Inertia::render('Student/Materials');
});

Route::get('/student/feedbacks', function () {
    return Inertia::render('Student/Feedbacks');
});

Route::get('/student/leaderboard', function () {
    return Inertia::render('Student/Leaderboard');
});

Route::get('/student/profile', function () {
    return Inertia::render('Student/Profile');
});

Route::get('/student/about', function () {
    return Inertia::render('Student/AboutUs');
});

<?php
require __DIR__ . '/../vendor/autoload.php';
$ref = new ReflectionMethod('ImageKit\ImageKit', 'listFiles');
echo json_encode($ref->getParameters());

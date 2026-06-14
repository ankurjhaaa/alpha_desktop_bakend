<?php
require __DIR__ . '/../vendor/autoload.php';
$ref = new ReflectionMethod('ImageKit\ImageKit', 'deleteFile');
echo json_encode($ref->getParameters());

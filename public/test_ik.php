<?php
require __DIR__ . '/../vendor/autoload.php';
$ik = new \ImageKit\ImageKit('pub', 'priv', 'http://example.com');
echo json_encode(get_class_methods($ik));

package com.klepra.ngbootupload.resource;

import com.klepra.ngbootupload.service.FileService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("file")
@AllArgsConstructor
@Slf4j
public class FileResource {

    public static final String DIRECTORY = System.getProperty("user.home") + "/Downloads/ng-boot-uploads/";

    private final FileService fileService;

    @PostMapping("upload")
    public ResponseEntity<List<String>> upload(@RequestParam("files") List<MultipartFile> multipartFiles) throws IOException {
        log.info("Uploading files");
        List<String> newFilenames = fileService.upload(multipartFiles);
        return ResponseEntity.ok(newFilenames);
    }

    @GetMapping("download/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable("filename") String filename) throws IOException {
        log.info("Downloading file {}", filename);
        return fileService.downloadFile(filename);
    }

    @GetMapping("list")
    public List<String> getAllUploadedFiles() {
        log.info("Fetching all uploaded filenames");
        return fileService.getAllUploadedFiles();
    }
}

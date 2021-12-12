package com.klepra.ngbootupload.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.nio.file.Files.copy;
import static java.nio.file.Paths.get;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

@Service
public class FileService {

    public static final String DIRECTORY = System.getProperty("user.home") + "/Downloads/ng-boot-uploads/";


    public List<String> upload(List<MultipartFile> multipartFiles) throws IOException {
        List<String> newFilenames = new ArrayList<>();
        File directory = new File(DIRECTORY);

        if (!directory.exists()) {
            if(!directory.mkdir()) {
                throw new IOException("Cannot create upload directory.");
            };
        }

        for (MultipartFile file : multipartFiles) {
            String filename = StringUtils.cleanPath(file.getOriginalFilename());
            Path fileStorage = get(DIRECTORY, filename).toAbsolutePath().normalize();
            copy(file.getInputStream(), fileStorage, REPLACE_EXISTING);
            newFilenames.add(filename);
        }

        return newFilenames;
    }

    public ResponseEntity<Resource> downloadFile(String filename) throws IOException {
        Path filePath = get(DIRECTORY).toAbsolutePath().normalize().resolve(filename);

        if (!Files.exists(filePath)) {
            throw new FileNotFoundException(filename + " not found");
        } else {
            Resource resource = new UrlResource(filePath.toUri());
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add("File-Name", filename);
            // httpHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment:File-Name="+ filename);
            httpHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment:File-Name=" + resource.getFilename());

            return ResponseEntity
                    .ok()
                    .contentType(MediaType.parseMediaType(Files.probeContentType(filePath)))
                    .headers(httpHeaders)
                    .body(resource);
        }
    }

    public List<String> getAllUploadedFiles()  {
        List<String> filenames = new ArrayList<>();
        File directory = new File(DIRECTORY);
        if ( directory.exists() && directory.isDirectory()) {
            List<String> files = Stream.of(directory.listFiles())
                    .filter(file -> !file.isDirectory())
                    .sorted((f1, f2) -> Long.compare(f2.lastModified(), f1.lastModified()))
                    .map(File::getName)
                    .collect(Collectors.toList());
            filenames.addAll(files);
        }
        return filenames;
    }


}
